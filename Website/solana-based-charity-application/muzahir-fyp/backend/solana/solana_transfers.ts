/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  Struct,
} from '@solana/web3.js';
import fs from 'mz/fs.js';
import path from 'path';
import * as borsh from 'borsh';

import {getPayer, getRpcUrl, createKeypairFromFile} from './utils.js';
import { Key } from 'readline';


/**
 * Seed values
 */
let seed = 1;

/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair;

/**
 * Program id
 */
let programId: PublicKey;


/**
 * Air Drop Amount
 */
const AIRDROP_AMOUNT = 500; 

/**
 * States Account data size
 */
const STATES_DATA_SIZE: number = 1024;

/**
 * State Saving Account
 */
var states_account: PublicKey | undefined = undefined;


/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve("/home/muzahir/Desktop/Solana/transfer-lamports/dist/program");

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'spl_example_transfer_lamports.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/helloworld.so`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'spl_example_transfer_lamports-keypair.json');


// Variable to hold the amount to send between accounts

class KeyMap extends Struct {
  initialized: boolean
  length: number
  account_maps: Map<string, number>
  // Called when deserializing
  constructor(fields) {
      super(fields)
      this.initialized = !!this.initialized // Convert 0/1 to false/true boolean
  }
}

const KeyMapSchema = new Map([
  [
      KeyMap,
      {
          kind: 'struct',
          fields: [
              ['initialized', 'u8'],
              ['length', 'u32'],
              ["account_maps",
                  {
                      // Outter map
                      kind: 'map',
                      key: 'string',
                      value: 'u64',
                  }]
          ]
      }
  ],
]);

class InstructionData {
  amount = 0;
  key = ""
  constructor(fields: {amount: number, key: string} | undefined = undefined) {
    if (fields) {
      this.amount = fields.amount;
      this.key = fields.key;
    }
  }
}

/**
 * Borsh schema definition for InstructionData struct
 */
 const InstructionDataSchema = new Map([
  [InstructionData, {kind: 'struct', fields: [['amount', 'u64'], ['key', 'string']]}],
]);

const AMOUNT_SIZE = borsh.serialize(
  InstructionDataSchema,
  new InstructionData(),
).length;



/**
 * Print values for testing
 */
 export async function printValues(): Promise<void> {

  __dirname

  console.log('__dirname: ', __dirname);
  console.log('PROGRAM_PATH: ', PROGRAM_PATH);
  console.log('PROGRAM_SO_PATH: ', PROGRAM_SO_PATH);
  console.log('PROGRAM_KEYPAIR_PATH: ', PROGRAM_KEYPAIR_PATH);
}


/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
  let fees = 0;
  if (!payer) {
    const {feeCalculator} = await connection.getRecentBlockhash();

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(AMOUNT_SIZE);

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    payer = await getPayer();
  }

  let lamports = await connection.getBalance(payer.publicKey);
  if (lamports < fees) {
    // If current balance is not enough to pay for fees, request an airdrop
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports,
    );
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(payer.publicKey);
  }

  console.log(
    'Using account',
    payer.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees',
  );
}

/**
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(): Promise<void> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``,
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      throw new Error(
        'Program needs to be deployed with `solana program deploy dist/program/helloworld.so`',
      );
    } else {
      throw new Error('Program needs to be built and deployed');
    }
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }
  console.log(`Using program ${programId.toBase58()}`);
}


/**
 * Create single Account for state saving
 */
export async function createStatesSavingAccount() {

    if (!(states_account === undefined)) {
      return states_account;
    }

    // Here, we would create an account and store it on the database.
    const SEED = String(++seed);
    let pubkey = await PublicKey.createWithSeed(
      payer.publicKey,
      SEED,
    programId,
    );
  
    const account = await connection.getAccountInfo(pubkey);
  
    if (account === null) {               // if key doesnot exist already, create it
      const lamports = await connection.getMinimumBalanceForRentExemption(
        STATES_DATA_SIZE,
      );
      const transaction = new Transaction().add(
    
        SystemProgram.createAccountWithSeed({
          fromPubkey: payer.publicKey,
          basePubkey: payer.publicKey,
          seed: SEED,
          newAccountPubkey: pubkey,
          lamports: lamports,
          space: STATES_DATA_SIZE,
          programId,
      }),
    );
      await sendAndConfirmTransaction(connection, transaction, [payer]);  
    }
    
    states_account = pubkey;
}


/**
 * Create Accounts
 */
export async function createAccount(): Promise<PublicKey> {
  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  

  // Here, we would create an account and store it on the database.
  const SEED = String(++seed);
  let pubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    SEED,
  programId,
  );

  const account = await connection.getAccountInfo(pubkey);

  if (account === null) {               // if key doesnot exist already, create it

    const lamports = await connection.getMinimumBalanceForRentExemption(
      AMOUNT_SIZE,
    );

    console.log("Minimum balance for Rent Exemption: ", lamports);
    const transaction = new Transaction().add(

      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: SEED,
        newAccountPubkey: pubkey,
        lamports: lamports,
        space: AMOUNT_SIZE,
        programId,
    }),
  );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
  
  return pubkey;
}

/**
 * Transfer Lamports
 */
export async function transferLamport( src: PublicKey, destination: PublicKey, amt: number, key?: string): Promise<void> {
  
  console.log("STATES SAVING ACCOUNT: ", states_account);

  let map_key: string = "";
  if (key == null)
    map_key = src.toString() + "_" + destination.toString();
  else
    map_key = key;
    
  const instruction_data = new InstructionData({
    amount: amt,
    key: map_key
  });

  const serialized_amount = Buffer.from(borsh.serialize(InstructionDataSchema, instruction_data));

  const instruction = new TransactionInstruction({
    keys: [
      {pubkey: src, isSigner: false, isWritable: true}, 
      {pubkey: destination, isSigner: false, isWritable: true},
      {pubkey: states_account!, isSigner: false, isWritable: true}      // exclamation mark to use the pubkey property os states_account
    ],
    programId,
    data: serialized_amount,
  });
  
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}

export async function get_account_info(src: PublicKey): Promise<void> {
  const accountInfo = await connection.getAccountInfo(src);
  if (accountInfo === null) {
    throw 'Error: cannot find the account';
  }
  const details: InstructionData = borsh.deserialize(
    InstructionDataSchema,
    InstructionData,
    accountInfo.data,
  );

  //console.log('Account Info\nId: ', accountInfo.owner.toBase58(), '\nBalance', accountInfo.lamports, '\n');
  console.log('Account Info\nId: ', src.toBase58(), '\nBalance', accountInfo.lamports, '\n');
}

// Will be used by the admin
// will received organization account in from (this is the account where donors will be sending), and another organization account in to.
export async function forward_funds(from: PublicKey, to: PublicKey): Promise<boolean>
{
  const kmap_deser: KeyMap = await get_states_account_info();

  // iterate through the dictionary
  for (const key of kmap_deser.account_maps.keys()) {
  
    if (key.endsWith(from.toString())) {          // find the key, get its value
      
      let amount = Number(kmap_deser.account_maps.get(key).toString());
      let sender = key.split("_")[0];
      let map_key = sender.toString() + "_" + to.toString();

      await transferLamport(new PublicKey(from), to, amount, map_key);

      // console.log("Key: ", key.toString());
      // console.log("Sender: ", sender.toString());
      // console.log("From: ", from);
      // console.log("To: ", to.toString());      
    }
  }

  return false;
}

export async function get_states_account_info(): Promise<KeyMap> {

  const accountInfo = await connection.getAccountInfo(states_account!);
  if (accountInfo === null) {
    throw 'Error: cannot find the account';
  }

  //console.log("\nBase64 encoded data\n", accountInfo.data);
  //console.log("\nBase64 encoded data\n", accountInfo.data.toString('base64'))
  const kmap_deser = borsh.deserializeUnchecked(KeyMapSchema, KeyMap, accountInfo.data);

  //console.log("Deserialized Data: ", kmap_deser);
  //console.log("Deserialized Data: ", kmap_deser.account_maps);
  
  // kmap_deser.account_maps.forEach((value: number, key: string) => {
  //   console.log(key, value.toString());
  // });

  return kmap_deser;
}