use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey, msg
    },
    solana_program_test::*,
    solana_sdk::{account::Account, signature::Signer, transaction::Transaction},
    spl_example_transfer_lamports::processor::process_instruction,
    std::str::FromStr,
};

use std::mem;

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct InstructionData {
    /// amount of lamports
    pub amount: u64,

    /// key to set the value against
    pub key: String
}


#[tokio::test]
async fn test_lamport_transfer() {
    let program_id = Pubkey::from_str("TransferLamports111111111111111111111111111").unwrap();
    let source_pubkey = Pubkey::new_unique();
    let destination_pubkey = Pubkey::new_unique();
    let state_account_pubkey = Pubkey::new_unique();

    let forward_account_dest_pubkey = Pubkey::new_unique();

    let mut program_test = ProgramTest::new(
        "spl_example_transfer_lamports",
        program_id,
        processor!(process_instruction),
    );
    program_test.add_account(
        source_pubkey,
        Account {
            lamports: 50,
            owner: program_id, // Can only withdraw lamports from accounts owned by the program
            ..Account::default()
        },
    );
    program_test.add_account(
        destination_pubkey,
        Account {
            lamports: 5,
            owner: program_id,
            ..Account::default()
        },
    );
    program_test.add_account(               // this account will be used to save states
        state_account_pubkey, 
        Account {
            lamports: 5,
            data: vec![0_u8; 1024],
            owner: program_id,
            ..Account::default()
        },
    );
    program_test.add_account(
        forward_account_dest_pubkey,
        Account {
            lamports: 5,
            ..Account::default()
        },
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;


    let lamport_amount = InstructionData { amount: 5, key: format!("{}_{}", source_pubkey.to_string(), destination_pubkey.to_string()) };
    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &lamport_amount,
            vec![
                AccountMeta::new(source_pubkey, false),
                AccountMeta::new(destination_pubkey, false),
                AccountMeta::new(state_account_pubkey, false)
            ]
        )],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();




    // second transaction

    let lamport_amount = InstructionData { amount: 5, key: format!("{}_{}", source_pubkey.to_string(), forward_account_dest_pubkey.to_string()) };
    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &lamport_amount,
            vec![
                AccountMeta::new(destination_pubkey, false),
                AccountMeta::new(forward_account_dest_pubkey, false),
                AccountMeta::new(state_account_pubkey, false)
            ]
        )],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();
}
