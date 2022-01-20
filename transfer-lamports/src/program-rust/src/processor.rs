//extern crate alloc;

//! Program instruction processor
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,
    msg
};
/// import BTreeMap
use std::{collections::BTreeMap, iter::repeat, mem};
use std::str::FromStr;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};


const INITIALIZED_BYTES: usize = 1;
const TRACKING_CHUNK_LENGTH: usize = 4;
const TRACKING_CHUNK_BYTES: usize = 1019;
const TRACKING_ACCOUNT_STATE_SPACE: usize = INITIALIZED_BYTES + TRACKING_CHUNK_LENGTH + TRACKING_CHUNK_BYTES;


/// Get the Borsh container count (le) from buffer
fn count_from_le(array: &[u8]) -> usize {
    (array[0] as usize)
        | (array[1] as usize) << 8
        | (array[2] as usize) << 16
        | (array[3] as usize) << 24
}

/// Convert a u32 to an array
fn transform_u32_to_array_of_u8(x: u32) -> [u8; 4] {
    let b1: u8 = ((x >> 24) & 0xff) as u8;
    let b2: u8 = ((x >> 16) & 0xff) as u8;
    let b3: u8 = ((x >> 8) & 0xff) as u8;
    let b4: u8 = (x & 0xff) as u8;
    [b4, b3, b2, b1]
}

/// Define the type of state stored in accounts
#[derive(Debug, Default, Clone)]
pub struct KeyMaps {
    
    /// initialize variable
    pub initialized: bool,

    /// mapping between keys and values
    pub account_maps: BTreeMap<String, u64>             //string contains concatinated keys of sender and recipient.
}

impl KeyMaps {

    /// Emulate Pack
    #[allow(clippy::ptr_offset_with_cast)]
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, TRACKING_ACCOUNT_STATE_SPACE];

        let (is_initialized_dst, hmap_len, hmap_dst) = mut_array_refs![
            dst,
            INITIALIZED_BYTES,
            TRACKING_CHUNK_LENGTH,
            TRACKING_CHUNK_BYTES
        ];

        is_initialized_dst[0] = self.initialized as u8;
        let data_ser = self.account_maps.try_to_vec().unwrap();
        //hmap_len[..].copy_from_slice(&transform_u32_to_array_of_u8(data_ser.len() as u32));
        hmap_len[..].copy_from_slice(&(data_ser.len() as u32).to_le_bytes());
        hmap_dst[..data_ser.len()].copy_from_slice(&data_ser);
    }

    /// Emulate Unpack
    #[allow(clippy::ptr_offset_with_cast)]
    fn unpack_from_slice(src: &[u8]) -> Self {
        let src = array_ref![src, 0, TRACKING_ACCOUNT_STATE_SPACE];
        let (is_initialized_src, hmap_len, hmap_src) = array_refs![
            src,
            INITIALIZED_BYTES,
            TRACKING_CHUNK_LENGTH,
            TRACKING_CHUNK_BYTES
        ];
        let is_initialized = match is_initialized_src {
            [0] => false,
            [1] => true,
            _ => panic!(),
        };
        let mut map_dser = BTreeMap::<String, u64>::new();
        //let hmap_length = count_from_le(hmap_len);
        let hmap_length = u32::from_le_bytes(*hmap_len) as usize;
        if hmap_length > 0 {
            map_dser = BTreeMap::<String, u64>::try_from_slice(&hmap_src[0..hmap_length]).unwrap()
        }
        Self {
            initialized: is_initialized,
            account_maps: map_dser,
        }
    }
}


/// This instruction data contains the amount and key to set the value against
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct InstructionData {
    /// amount of lamports
    pub amount: u64,

    /// key to set the value against
    pub key: String
}


/// Instruction processor
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    // get account where we have to store state

    let source_info = next_account_info(account_info_iter)?;
    let destination_info = next_account_info(account_info_iter)?;
    let states_account_info = next_account_info(account_info_iter)?;
    let mut status: bool = false;

    // transfer lamports
    let data: InstructionData = {
        match InstructionData::try_from_slice(instruction_data)
        {
            Ok(data) => data,
            Err(_) => return Err(ProgramError::InvalidArgument)
        }
    };

    let amount: u64 = data.amount;
    let key: String = data.key;

    if amount <= **source_info.try_borrow_mut_lamports()? {

        // Withdraw lamports from the source
        **source_info.try_borrow_mut_lamports()? -= amount;
    
        // Deposit lamports into the destination
        **destination_info.try_borrow_mut_lamports()? += amount;

        status = true;
    }


    if status {
        // saving state

        //let key_string: String = format!("{}_{}", source_info.key.to_string(), destination_info.key.to_string());
        let mut key_maps = KeyMaps::unpack_from_slice(&states_account_info.data.borrow());

        let mut new_amount: u64 = amount;
        if key_maps.account_maps.contains_key(&key) {
            
            let curr_amount: u64 = *key_maps.account_maps.get(&key).unwrap();
            new_amount += curr_amount;
        }
        else {
            let splitted_keys: Vec<&str> = key.split("_").collect();
            
            // if we have pairs in the maps
            if splitted_keys.len() > 1 && key_maps.account_maps.len() > 0{

                for pair in key_maps.clone().account_maps {
                    if pair.0.starts_with(splitted_keys[0]) {
                        key_maps.account_maps.remove(&pair.0).unwrap();
                    }
                }
            }
        }
        key_maps.initialized = true;
        key_maps.account_maps.insert(key, new_amount);
        key_maps.pack_into_slice(&mut &mut states_account_info.data.borrow_mut()[..]);
    }
    else {
        return Err(ProgramError::InsufficientFunds);
    }

    //msg!("Key Pair: \n{:?}\n", KeyMaps::unpack_from_slice(&states_account_info.data.borrow()));
    Ok(())
}



/*
/// Instruction processor
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    // get account where we have to store state

    let source_info = next_account_info(account_info_iter)?;
    let destination_info = next_account_info(account_info_iter)?;
    let states_account_info = next_account_info(account_info_iter)?;
    let mut status: bool = false;

    // let key_string: String = format!("{}_{}", source_info.key.to_string(), destination_info.key.to_string());
    // msg!("Concatinated Address: {}", key_string);

    // let splitted_keys: Vec<&str> = key_string.split("_").collect();
    // msg!("Splitted Keys: {:?}", splitted_keys);

    // let new_src = Pubkey::from_str(splitted_keys[0]).unwrap();
    // msg!("New_SRC: {:?}", new_src);

    // if new_src == *source_info.key {
    //     msg!("Decoded String MATCHED the orignal key");
    // }
    // else {
    //     msg!("Decoded String DID NOT Matched the orignal key")
    // }

    // transfer lamports
    let amount: u64 = {
        match LamportAmount::try_from_slice(instruction_data)
        {
            Ok(amount_struct) => amount_struct.amount,
            Err(_) => 0
        }
    };

    if amount <= **source_info.try_borrow_mut_lamports()? {

        // Withdraw lamports from the source
        **source_info.try_borrow_mut_lamports()? -= amount;
    
        // Deposit lamports into the destination
        **destination_info.try_borrow_mut_lamports()? += amount;

        status = true;
    }


    if status {
        // saving state

        let key_string: String = format!("{}_{}", source_info.key.to_string(), destination_info.key.to_string());
        let mut key_maps = KeyMaps::unpack_from_slice(&states_account_info.data.borrow());

        let mut new_amount: u64 = amount;
        if key_maps.account_maps.contains_key(&key_string) {

            //msg!("Log Added 2");

            let curr_amount: u64 = *key_maps.account_maps.get(&key_string).unwrap();
            new_amount += curr_amount;
        }
        
        key_maps.initialized = true;
        key_maps.account_maps.insert(key_string, new_amount);
        key_maps.pack_into_slice(&mut &mut states_account_info.data.borrow_mut()[..]);
    }
    else {
        return Err(ProgramError::InsufficientFunds);
    }

    //msg!("Key Pair: {:?}", KeyMaps::unpack_from_slice(&states_account_info.data.borrow()));
    Ok(())
}

*/

/*
/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Counter {
    /// mappings of the keys
    pub data: u32,
}

/// Instruction processor
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    // get account where we have to store state
    let states_account_info = next_account_info(account_info_iter)?;
    
    msg!("SIZE OF U32: {}", mem::size_of::<u32>());
    msg!("SIZE OF Counter: {}", mem::size_of::<Counter>());
    msg!("SIZE OF KeyMaps: {}", mem::size_of::<KeyMaps>());

    msg!("LOG Added 1\n");
    let mut counter = Counter::try_from_slice(&states_account_info.data.borrow())?;
    counter.data = 1234567;

    msg!("LOG Added 2\n");
    counter.serialize(&mut &mut states_account_info.data.borrow_mut()[..])?;  
    
    msg!("Data Saved is: {:?}", Counter::try_from_slice(&states_account_info.data.borrow())?.data);

    Ok(())
}
*/

/*
/// Instruction processor
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Create an iterator to safely reference accounts in the slice
    let account_info_iter = &mut accounts.iter();

    // As part of the program specification the first account is the source
    // account and the second is the destination account
    let source_info = next_account_info(account_info_iter)?;
    let destination_info = next_account_info(account_info_iter)?;
    let states_account_info = next_account_info(account_info_iter)?;

    //let mut account_maps = KeyMaps::try_from_slice(&states_account_info.data.borrow());
    //msg!("Data: {:?}\n", &states_account_info.data.borrow());

    let amount: u64 = {
                        match LamportAmount::try_from_slice(instruction_data)
                        {
                            Ok(amount_struct) => amount_struct.amount,
                            Err(_) => 0
                        }
                    };

    //msg!("Amount before{}\n", **destination_info.try_borrow_mut_lamports()?);

    // let mut mappings : BTreeMap<Pubkey, BTreeMap<Pubkey,u64>> = BTreeMap::new();
    // let mut pair: BTreeMap<Pubkey,u64> = BTreeMap::new();
    // pair.insert(*source_info.key, amount);
    // mappings.insert(*destination_info.key, pair);

    // now put it in a struct, serialize it and store it on account data
    // let key_maps: KeyMaps = KeyMaps {
    //     account_maps: mappings
    // };
    //let mut buffer: Vec<u8> = Vec::new();
    //key_maps.serialize(&mut buffer).unwrap();
    //&states_account_info.data.borrow() = buffer;
    
    //key_maps.serialize(&mut &mut states_account_info.data.borrow_mut()[..])?;
    //msg!("Data Serializedddddddd: {:?}\n", &states_account_info.data.borrow());

    //msg!("LOG Added ZEROOOOOO\n");
    //let mut counter = Counter::try_from_slice(&states_account_info.data.borrow())?;
    //counter.data = xyz;
    //counter.serialize(&mut &mut states_account_info.data.borrow_mut()[..])?;
    
    msg!("LOG Added 1\n");
    let xyz: u64 = 1234567;
    let counter_struct = Counter {
         data: xyz
    };
    counter_struct.serialize(&mut &mut states_account_info.data.borrow_mut()[..])?;
    msg!("LOG Added 2\n");


    if amount <= **source_info.try_borrow_mut_lamports()? {

        // Withdraw lamports from the source
        **source_info.try_borrow_mut_lamports()? -= amount;
    
        // Deposit lamports into the destination
        **destination_info.try_borrow_mut_lamports()? += amount;
    }

    //msg!("Amount After{}\n", **destination_info.try_borrow_mut_lamports()?);

    Ok(())
}
*/