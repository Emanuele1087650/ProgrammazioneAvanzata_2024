import { Sequelize, DataTypes, where, Transaction } from 'sequelize';
import {SequelizeDB} from '../singleton/sequelize'
import { User } from "./users";

const sequelize = SequelizeDB.getConnection();

export const Dataset = sequelize.define(
  "datasets",
  {
    id_dataset: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    id_creator: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id_user",
      },
    },
  },
  {
    tableName: "datasets",
    timestamps: false,
    freezeTableName: true,
  }
);