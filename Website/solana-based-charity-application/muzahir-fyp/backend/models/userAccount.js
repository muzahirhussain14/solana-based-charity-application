"use strict";
const { Model } = require("sequelize");
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // UserAccount.belongsTo(models.Role, { foreignKey: "roleId" });
      // UserAccount.belongsTo(models.Permission, {
      //   foreignKey: "permissionId",
      // });
    }
  }

  UserAccount.createNew = function (junction) {
    return this.findOrCreate({
      where: {},
      defaults: junction,
    });
  };

  UserAccount.findByName = function (name) {
    return this.findOne({ where: { name } });
  };

  UserAccount.getOneWhere = function (where) {
    return this.findOne({ where });
  };

  UserAccount.getAllWhere = function (where) {
    return this.findAll({ where });
  };

  UserAccount.getPaginated = function (options) {
    return this.findAndCountAll(options);
  };

  UserAccount.updatePermissionRole = function (updateData, options) {
    return this.update(updateData, options);
  };

  UserAccount.deletePermissionRole = function (where) {
    return this.destroy(where);
  };

  UserAccount.init(
    {
      userId: DataTypes.INTEGER,
      accountId: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserAccount",
      tableName: "UserAccounts",
    }
  );
  return UserAccount;
};
