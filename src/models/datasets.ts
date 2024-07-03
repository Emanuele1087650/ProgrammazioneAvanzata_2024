import { Sequelize, DataTypes, where, Transaction } from 'sequelize';
import {SequelizeDB} from '../singleton/sequelize'
import { Users } from "./users";

const sequelize = SequelizeDB.getConnection();

export const Datasets = sequelize.define(
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
        model: Users,
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