import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes, Transaction } from "sequelize";
import { Dataset } from "./datasets";
import { User } from "./users";

const sequelize = SequelizeDB.getConnection();

export const Request = sequelize.define(
  "request",
  {
    id_request: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    req_status: {
      type: DataTypes.ENUM,
      values: ['PENDING', 'RUNNING', 'FAILED', 'ABORTED', 'COMPLETED'],
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    req_cost: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
    },
    req_users: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id_user",
      },
    },
    req_dataset: {
      type: DataTypes.INTEGER,
      references: {
        model: Dataset,
        key: "id_dataset",
      },
    },
  },
  {
    tableName: "request",
    timestamps: false,
    freezeTableName: true,
  }
);