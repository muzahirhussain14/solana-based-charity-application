"use strict";
const { Model } = require("sequelize");
const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      Account.belongsToMany(models.User, {
        through: "UserAccounts",
        foreignKey: "accountId",
        as: "transactions",
      });
    }
  }

  Account.createNew = function (account) {
    return this.findOrCreate({
      where: {
        [Sequelize.Op.or]: [{ account_id: account.account_id }],
      },
      defaults: account,
    });
  };

  Account.findByName = function (name) {
    return this.findOne({ where: { name } });
  };

  Account.findById = function(id) {
    return this.findOne({ where: {id} });
  }

  Account.getOneWhere = function (where) {
    return this.findOne(where);
  };

  Account.getAllWhere = function (where) {
    return this.findAll(where);
  };

  Account.getPaginated = function (options) {
    return this.findAndCountAll(options);
  };

  Account.updateAccount = function (updateData, options) {
    return this.update(updateData, options);
  };

  Account.deleteAccount = function (where) {
    return this.destroy(where);
  };

  Account.init(
    {
      title: DataTypes.STRING,
      account_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Account",
      tableName: "accounts",
    }
  );
  return Account;
};
