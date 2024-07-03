import { Sequelize, DataTypes, where, Transaction } from 'sequelize';
import {SequelizeDB} from '../singleton/sequelize'

const sequelize = SequelizeDB.getConnection();

export const User = sequelize.define(
    "users",
    {
      id_user: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM,
        values: ["ADMIN", "USER"],
        defaultValue: "USER",
        allowNull: false,
      },
      tokens: {
        type: DataTypes.REAL,
        defaultValue: 10,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      freezeTableName: true,
    }
);
