import { DataTypes, Transaction } from 'sequelize';
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

export async function getDatasetById(id_dataset: number) {
  const dataset = await Dataset.findByPk(id_dataset, {
    raw: true,
  });
  if (!dataset) {
    throw new Error(`Dataset with id ${id_dataset} not found`);
  }
  return dataset;
}

export async function getAllDataset() {
  const datasets = await Dataset.findAll()
  if(!datasets) {
    throw new Error('No datasets found');
  }
}

export async function getDatasetsByUser(id_user: number) {
  const datasets = await Dataset.findAll({
    where: {
      id_creator: id_user,
    },
    raw: true
  });
  if (!datasets) {
    throw new Error(`Dataset created by user ${id_user} not found`);
  }
  return datasets;
}
