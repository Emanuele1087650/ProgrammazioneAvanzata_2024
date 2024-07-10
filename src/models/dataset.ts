import { DataTypes, Model, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize';
import { User } from './users';
import { ErrorFactory, ErrorType } from '../factory/errFactory';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

class Dataset extends Model {
  private id_dataset!: number;
  private cost!: number;
  private name_dataset!: string;
  private id_creator!: number;

  async getCost() {
    return this.cost;
  }

  async updateCost(new_cost: number, transaction: Transaction) {
    const data = {cost: new_cost};
    await this.update(data, {
      transaction
    }).catch(() => {
      throw errorHandler.createError(ErrorType.UPDATE_COST_FAILED);
    });
  }

  async deleteDataset(transaction: Transaction) {       
    await this.destroy({
       transaction 
      }).catch(() => {
      throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);
    });
  }

  async updateDataset(new_name: string, transaction: Transaction) {
    const data = {name_dataset: new_name}
    await this.update(data, {
      transaction
    }).catch(() => {
      throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);
    });
  }

}

Dataset.init({
  id_dataset: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cost: {
    type: DataTypes.REAL,
    defaultValue: 0,
  },
  name_dataset: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  id_creator: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id_user',
    },
  },
}, {
  sequelize,
  tableName: 'dataset',
  timestamps: false,
  freezeTableName: true,
});

async function createDataset(data: any, transaction: Transaction) {
  const datasets = await Dataset.findAll({
    where: data,
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (datasets.length !== 0) {
    throw errorHandler.createError(ErrorType.DATASET_ALREADY_EXIST);
  } else {
    await Dataset.create(data,
    { 
      transaction: transaction
    }).catch(() => {
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR); 
    });
  }
}

async function getDatasetByName(name: string, id_user: number) {
  const dataset = await Dataset.findOne({
    where: {
      name_dataset: name,
      id_creator: id_user
    },
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR); 
  });
  if(!dataset){
    throw errorHandler.createError(ErrorType.NO_DATASET_NAME);
  }
  return dataset;
}

async function getAllDataset(id_user: number) {
  const datasets = await Dataset.findAll({
    where: {
      id_creator: id_user,
    }
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  })
  if(datasets.length === 0){
    throw errorHandler.createError(ErrorType.NO_DATASETS);
  }
  return datasets;
}

export { Dataset, createDataset, getDatasetByName, getAllDataset };
