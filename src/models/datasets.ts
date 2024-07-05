import { DataTypes, Transaction } from 'sequelize';
import {SequelizeDB} from '../singleton/sequelize'
import { User } from "./users";
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import { isEmpty } from 'bullmq';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

export const Dataset = sequelize.define(
  "dataset",
  {
    id_dataset: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_dataset: {
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
    tableName: "dataset",
    timestamps: false,
    freezeTableName: true,
  }
);

export async function createDataset(data: any, transaction: Transaction) {
  await checkDatasetUser(data.id_creator, data.name_dataset);
  await Dataset.create(data, 
    { 
      transaction: transaction 
    }).catch(async () => {
      await transaction.rollback();
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR); 
    });
}

export async function checkDatasetUser(id_user: number, name: string) {
  const datasets = await Dataset.findAll({
    where: {
      name_dataset: name,
      id_creator: id_user,
    },
    raw: true
  });
  if (!(datasets.length === 0)) {
    throw errorHandler.createError(ErrorType.DATASET_ALREADY_EXIST);
  }
  if (!datasets) {
    throw new Error(`Dataset created by user ${id_user} not found`);
  }
  return;
}

export async function getDatasetById(id_dataset: number) {
  const dataset = await Dataset.findByPk(id_dataset, {
    raw: true,
  });
  if(dataset===null){
    throw errorHandler.createError(ErrorType.NO_DATASET_ID);
  }
  return dataset;
}

export async function getDatasetByName(name: string) {
  const dataset = await Dataset.findAll({
    where: {
      name_dataset: name,
    },
    raw: true
  });
  if(dataset===null){
    //throw errorHandler.createError(ErrorType.NO_DATASET_ID);
  }
  return dataset;
}

export async function getAllDataset() {
  const datasets = await Dataset.findAll()
  if(!datasets) {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  }
  if(datasets.length === 0){
    throw errorHandler.createError(ErrorType.NO_DATASETS);
  }
  return datasets;
}

export async function getDatasetsByUser(id_user: number, name: string) {
  const datasets = await Dataset.findAll({
    where: {
      name_dataset: name,
      id_creator: id_user,
    },
    raw: true
  });
  if (datasets.length === 0) {
    throw errorHandler.createError(ErrorType.NO_DATASET_ID);
  }
  if (!datasets) {
    throw new Error(`Dataset created by user ${id_user} not found`);
  }
  return datasets;
}

export async function deleteDatasetById(id: number) {
  const dataset = await getDatasetById(id);
  if(dataset===null){
    throw errorHandler.createError(ErrorType.NO_DATASET_ID);
  }
  const tr = await sequelize.transaction();
  await Dataset.destroy({
    where: {
      id_dataset: id,
    },
    transaction: tr,
  }).catch(()=>{throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);});
  await tr.commit();
}

export async function updateDatasetByName(req: any) {
  var name = req.body["name"];
  var new_name = req.body["new_name"];

  const tr = await sequelize.transaction();
  await Dataset.update(
    {
      name_dataset: new_name
    }, 
    {
      where: {
        name_dataset: name,
      },
      transaction: tr,
    }).catch(()=>{throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);});
  await tr.commit();
}
