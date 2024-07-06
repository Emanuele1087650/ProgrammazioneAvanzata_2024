import { Sequelize, DataTypes, Model, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize';
import { User } from './users';
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import { isEmpty } from 'bullmq';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

interface DatasetData {
    name_dataset: string;
    id_creator: number;
    id_dataset?: number;
  }

class Dataset extends Model {
  public id_dataset!: number;
  public name_dataset!: string;
  public id_creator!: number;

  // Creazione del dataset
  static async createDataset(data: any, transaction: Transaction) {

    await Dataset.checkDatasetUser(data.id_creator, data.name_dataset);
    
    await Dataset.create(data, 
    { 
      transaction: transaction 
    }).catch(async () => {
      await transaction.rollback();
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR); 
    });
  }

  // Aggiornamento del dataset
  async updateDataset(req: any, transaction?: Transaction) {
    const data = {name_dataset: req.body["new_name"]}
    const result = await this.update(data, {
    transaction
    }).catch(()=>{throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);});;
    return result;
  }

  static async getDatasetByName(name: string, user: any) {
    const dataset = await Dataset.findAll({
      where: {
        name_dataset: name,
        id_creator: user.id_user
      },
    })
    if(dataset.length === 0){
      throw errorHandler.createError(ErrorType.NO_DATASET_NAME);
    }
    return dataset[0];
  }

  static async getAllDataset(user: any) {
    const datasets = await Dataset.findAll({where: {
      id_creator: user.id_user,
    },})
    if(!datasets) {
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    }
    if(datasets.length === 0){
      throw errorHandler.createError(ErrorType.NO_DATASETS);
    }
    return datasets;
  }

  // Eliminazione del dataset
  public async deleteDataset(transaction?: Transaction) {       
    await this.destroy({ transaction }).catch(()=>{throw errorHandler.createError(ErrorType.DATASET_DELETION_FAILED);});
  }

  // Controllo dataset per utente
  static async checkDatasetUser(id_user: number, name: string) {
    const datasets = await Dataset.findAll({
      where: {
        name_dataset: name,
        id_creator: id_user,
      },
      raw: true,
    });
    if (datasets.length !== 0) {
      throw errorHandler.createError(ErrorType.DATASET_ALREADY_EXIST);
    }
  }
}

Dataset.init({
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
      key: 'id_user',
    },
  },
}, {
  sequelize,
  tableName: 'dataset',
  timestamps: false,
  freezeTableName: true,
});

export { Dataset };
