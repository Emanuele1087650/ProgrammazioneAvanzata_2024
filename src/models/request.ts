import { Sequelize, DataTypes, Model, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize';
import { Dataset } from './dataset';
import { User } from './users';
import { ErrorFactory, ErrorType } from '../factory/errFactory';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

interface RequestData {
  req_status: string;
  metadata: any;
  req_cost: number;
  timestamp?: Date;
  req_user: number;
  req_dataset?: number;
}

class Request extends Model implements RequestData{
  public id_request!: number;
  public req_status!: string;
  public metadata!: any;
  public req_cost!: number;
  public timestamp!: Date;
  public req_user!: number;
  public req_dataset!: number;

  async createRequest(data: any, transaction: Transaction) {
    try {
      const result = await Request.create(data, { transaction });
      return result;
    } catch (error) {
      await transaction.rollback();
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    }
  }

  async updateRequest(id_user: number, id_dataset: number, req_status: string, transaction: Transaction) {
    try {
      await Request.update({
        req_status: req_status
      }, {
        where: {
          id_user: id_user,
          id_dataset: id_dataset
        },
        transaction: transaction
      }).catch(() => {
        throw errorHandler.createError(ErrorType.BAD_REQUEST); 
      });
    } catch {
      throw new Error('Error during request update');
    }
  }

  async getAllRequests() {
    const requests = await Request.findAll();
    if (!requests || requests.length === 0) {
      throw errorHandler.createError(ErrorType.BAD_REQUEST);
    }
    return requests;
  }

  async getRequestsByUser(id_user: number) {
    const requests = await Request.findAll({ where: { req_user: id_user } });
    if (!requests || requests.length === 0) {
      throw errorHandler.createError(ErrorType.BAD_REQUEST);
    }
    return requests;
  }

  async getRequestsByDataset(id_dataset: number) {
    const requests = await Request.findAll({ where: { req_dataset: id_dataset } });
    if (!requests || requests.length === 0) {
      throw errorHandler.createError(ErrorType.BAD_REQUEST);
    }
    return requests;
  }

  async getRequestsByUserAndDataset(id_user: number, id_dataset: number) {
    const requests = await Request.findAll({ where: { req_user: id_user, req_dataset: id_dataset } });
    if (!requests || requests.length === 0) {
      throw errorHandler.createError(ErrorType.BAD_REQUEST);
    }
    return requests;
  }

  async inference(user: any, dataset: any, request: any, transaction: Transaction, model?: string, cam_det?: boolean, cam_cls?: boolean) {
    await this.createRequest(request, transaction);
    if (user.tokens > request.req_cost) {
      const response = await fetch(`http://127.0.0.1:8000/inference/${user.username}/${dataset.name}/${model}/${cam_det}/${cam_cls}`, {
        method: 'POST'
      });
      if (response.body !== null) {
        await this.updateRequest(user.id_user, dataset.id_dataset, 'COMPLETED', transaction) 
        return response
      }
    }
    await this.updateRequest(user.id_user, dataset.id_dataset, 'ABORTED', transaction) 
  }

}

Request.init({
  id_request: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  req_status: {
    type: DataTypes.ENUM,
    values: ['PENDING', 'RUNNING', 'FAILED', 'ABORTED', 'COMPLETED'],
    defaultValue: 'PENDING',
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
  req_user: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id_user',
    },
  },
  req_dataset: {
    type: DataTypes.INTEGER,
    references: {
      model: Dataset,
      key: 'id_dataset',
    },
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'request',
  timestamps: false,
  freezeTableName: true,
});

export { Request };
