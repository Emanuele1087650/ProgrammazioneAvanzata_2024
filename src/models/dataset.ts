import { DataTypes, Model, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize';
import { User } from './users';
import { ErrorFactory, ErrorType } from '../factory/errFactory';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

class Dataset extends Model {
  private idDataset!: number;
  private cost!: number;
  private nameDataset!: string;
  private idCreator!: number;

  async getCost() {
    return this.cost;
  }

  async getName() {
    return this.nameDataset;
  }

  async updateCost(newCost: number, transaction: Transaction) {
    const data = { cost: newCost };
    await this.update(data, {
      transaction,
    }).catch(() => {
      throw errorHandler.createError(ErrorType.UPDATE_COST_FAILED);
    });
  }

  async deleteDataset(transaction: Transaction) {
    await this.destroy({
      transaction,
    }).catch(() => {
      throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);
    });
  }

  async updateDataset(newName: string, transaction: Transaction) {
    const data = { nameDataset: newName };
    await this.update(data, {
      transaction,
    }).catch(() => {
      throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);
    });
  }
}

Dataset.init(
  {
    idDataset: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cost: {
      type: DataTypes.REAL,
      defaultValue: 0,
    },
    nameDataset: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    idCreator: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'idUser',
      },
    },
  },
  {
    sequelize,
    tableName: 'dataset',
    timestamps: false,
    freezeTableName: true,
  },
);

async function createDataset(data: any, transaction: Transaction) {
  const datasets = await Dataset.findOne({
    where: data,
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (datasets) {
    throw errorHandler.createError(ErrorType.DATASET_ALREADY_EXIST);
  } else {
    await Dataset.create(data, {
      transaction,
    }).catch(() => {
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    });
  }
}

async function getDatasetByName(name: string, idUser: number) {
  const dataset = await Dataset.findOne({
    where: {
      nameDataset: name,
      idCreator: idUser,
    },
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (!dataset) {
    throw errorHandler.createError(ErrorType.NO_DATASET_NAME);
  }
  return dataset;
}

async function getAllDataset(idUser: number) {
  const datasets = await Dataset.findAll({
    where: {
      idCreator: idUser,
    },
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (datasets.length === 0) {
    throw errorHandler.createError(ErrorType.NO_DATASETS);
  }
  return datasets;
}

export { Dataset, createDataset, getDatasetByName, getAllDataset };
