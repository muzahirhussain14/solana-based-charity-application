"use strict";
const { Model } = require("sequelize");
const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Account, {
        through: "UserAccounts",
        foreignKey: "userId",
        as: "accounts",
      });
    }
  }

  User.createNew = function (user) {
    return this.findOrCreate({
      where: {
        [Sequelize.Op.or]: [{ email: user.email }],
      },
      defaults: user,
    });
  };

  User.findById = function(id) {
    return this.findOne({ where: {id} });
  }

  User.findByName = function (name) {
    return this.findOne({ where: { name } });
  };

  User.getOneWhere = function (where) {
    return this.findOne(where);
  };

  User.getAllWhere = function (where) {
    return this.findAll(where);
  };

  User.getPaginated = function (options) {
    return this.findAndCountAll(options);
  };

  User.updateUser = function (updateData, options) {
    return this.update(updateData, options);
  };

  User.deleteUser = function (where) {
    return this.destroy(where);
  };

  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      accountId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
