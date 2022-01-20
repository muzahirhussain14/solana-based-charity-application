/**
 * Hello world
 */

import { PublicKey } from '@solana/web3.js';
import {
    establishConnection,
    establishPayer,
    checkProgram,
    printValues,
    createAccount,
    transferLamport,
    get_account_info,
    createStatesSavingAccount,
    get_states_account_info,
    forward_funds
  } from './solana_transfers';
  

  export async function initSolana() {
    // Establish connection to the cluster
    await establishConnection();
  
    // Determine who pays for the fees
    await establishPayer();
  
    // Check if the program has been deployed
    await checkProgram();
  
    // Create states Account, that will be passed with each transaction
    await createStatesSavingAccount()
  }

  export async function getAccountInfo(account: string) {
    let pub_key_cast = new PublicKey(account);
    console.log("\nACCOUNT INFO, ", account);
    await get_account_info(pub_key_cast);
  }

  export async function getStatesAccountInfo(): Promise<Map<string, number>> {
    let result = await get_states_account_info();
    return result.account_maps;
  }

  export async function createSolanaAccount(): Promise<string> {
    let account: PublicKey = await createAccount()
    return account.toString();
  }

  export async function transferAmount(src: string, dest: string, amount: number) {
    await transferLamport(new PublicKey(src), new PublicKey(dest), amount);
  }

  export async function transferAmountWithKey(src: string, dest: string, amount: number, key: string) {
    await transferLamport(new PublicKey(src), new PublicKey(dest), amount, key);
  }

  export async function forwardFunds(src: string, dest: string) {
    await forward_funds(new PublicKey(src), new PublicKey(dest));
  }