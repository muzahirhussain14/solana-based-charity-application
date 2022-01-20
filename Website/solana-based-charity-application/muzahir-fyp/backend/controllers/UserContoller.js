const User = require("../models").User;
const Account = require("../models").Account;
const UserAccount = require("../models").UserAccount;
//const solana = require(".././app").solana;
const solana = require("../solana/solana.js");

exports.create = async ({ name, email, password }) => {

  let accountId = await solana.createSolanaAccount();   // create new account in solana blockchain and get its id
  let create = await User.createNew({
    name,
    email,
    password,
    accountId
  });
  return create;
};

exports.getAll = async () => {
  let fetch = await User.getAllWhere({
    include: [
      {
        model: Account,
        as: "accounts",
        through: {
          attributes: ["amount"],
          as: "transaction",
        },
      },
    ],
  });

  return fetch;
};

exports.login = async ({ email, password }) => {
  let fetch = await User.getAllWhere({
    where: {
      email,
      password,
    },
    include: [
      {
        model: Account,
        as: "accounts",
        through: {
          attributes: ["amount"],
          as: "transaction",
        },
      },
    ],
  });
  return fetch;
};

exports.getAllTransactions = async () => {
  let fetch = await UserAccount.getAllWhere({});

  return fetch;
};