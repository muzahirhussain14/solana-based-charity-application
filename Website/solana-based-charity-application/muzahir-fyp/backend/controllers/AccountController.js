const Account = require("../models").Account;
const UserAccount = require("../models").UserAccount;
const User = require("../models").User;
const {PublicKey} = require("@solana/web3.js");
const solana = require("../solana/solana.js");

let states = [];

exports.create = async ({ title, accountId }) => {
  let create = await Account.createNew({
    title,
    account_id: accountId,
  });
  return create;
};

exports.createJunction = async ({ userId, accountId, amount }) => {

  var flag = false;

  // get userId's account
  let src_account = await User.findById(userId);

  console.log("\nsrc_account: ", src_account);

  if (src_account && src_account.dataValues) {
    let src_account_id = src_account.dataValues.accountId;
    let destination = accountId;

    console.log("\nBefore Transfer\n");
    await solana.getAccountInfo(src_account_id);
    await solana.getAccountInfo(destination);

    // call solana's api to transfer lamports from source to destination
    await solana.transferAmount(src_account_id, destination, amount);
    
    console.log("\n\nAfter Transfer\n");
    await solana.getAccountInfo(src_account_id);
    await solana.getAccountInfo(destination);

    // states data
    console.log("\nGet States Data\n");
    let data = await solana.getStatesAccountInfo();
    console.log("Data: ", data);
    
    flag = true;
  }

  if (flag == true) {
  
    let acc = await Account.createNew({ account_id: accountId });

    let create = await UserAccount.create({
      userId,
      accountId: acc[0].dataValues.id,
      amount,
    });
    return create;
  }

  return null;
};

exports.setStatesVariable = (state) => {
  states.push(state);
}

exports.getStatesVariable = () => {
  return states;
}

exports.getStates = async () => {
  let fetch = await solana.getStatesAccountInfo();
  return fetch;                   // returns a map<string, number>
}

exports.forwardFunds = async (from, to) => {
  let fetch = await solana.forwardFunds(from, to);
}

exports.getAll = async () => {
  let fetch = await Account.getAllWhere({});
  return fetch;
};
