/**
 * Hello world
 */

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

async function main() {
  
  // Establish connection to the cluster
  await printValues();

  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  // Create states Account, that will be passed with each transaction
  await createStatesSavingAccount()

  // Create accounts
  let donor = await createAccount();
  let donor_2 = await createAccount();

  let organization = await createAccount();  
  let organization_2 = await createAccount();
  let organization_3 = await createAccount();
  

  console.log("\nDetails before sending Lamports\n");
  await get_account_info(donor);
  await get_account_info(donor_2);
  await get_account_info(organization);
  await get_account_info(organization_2);
  await get_account_info(organization_3);

  console.log("Transfering lamports between accounts");
  await transferLamport(donor, organization, 50);
  await transferLamport(donor_2, organization, 50);

  console.log("\nDetails after sending Lamports\n");
  // await get_account_info(account1);
  // await get_account_info(account2);
  await get_states_account_info();


  // forward funds, will be used by admin only
  await forward_funds(organization, organization_2);
  
  console.log("\nAfter first Fund transfer State\n");
  await get_states_account_info();


  await forward_funds(organization_2, organization_3);

  console.log("\nAfter second Fund transfer State\n");
  await get_states_account_info();


  console.log("\nDetails before sending Lamports\n");
  await get_account_info(donor);
  await get_account_info(donor_2);
  await get_account_info(organization);
  await get_account_info(organization_2);
  await get_account_info(organization_3);

  console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
