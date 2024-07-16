import { DataTypes, Model, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize';
import { Json } from 'sequelize/types/utils';
import { ErrorFactory, ErrorType } from '../factory/errFactory';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

class Request extends Model {
  public idRequest!: number;
  public cost!: number;
  public idCreator!: number;
  public status!: string;
  public results!: Json;

  /**
   * Gets the ID of the request.
   * 
   * @returns {Promise<number>} The ID of the request.
   */
  async getIdRequest() {
    return this.idRequest;
  }

  /**
   * Gets the ID of the creator.
   * 
   * @returns {Promise<number>} The ID of the creator.
   */
  async getIdCreator() {
    return this.idCreator;
  }

  /**
   * Gets the status of the request.
   * 
   * @returns {Promise<string>} The status of the request.
   */
  async getStatus() {
    return this.status;
  }

  /**
   * Gets the results of the request.
   * 
   * @returns {Promise<Json>} The results of the request.
   */
  async getResults() {
    return this.results;
  }

  /**
   * Updates the status of the request.
   * 
   * @param {string} newStatus - The new status to set.
   * @param {Transaction} transaction - The transaction object.
   */
  async updateStatus(newStatus: string, transaction: Transaction) {
    const data = { status: newStatus };
    await this.update(data, {
      transaction,
    }).catch(() => {
      throw errorHandler.createError(ErrorType.UPDATE_COST_FAILED);
    });
  }
}

Request.init(
  {
    idRequest: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_request',
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    idCreator: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_creator',
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['PENDING', 'RUNNING', 'FAILED', 'ABORTED', 'COMPLETED'],
      defaultValue: 'PENDING',
    },
    results: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Job',
    tableName: 'request',
    timestamps: false,
    freezeTableName: true,
  },
);

/**
 * Creates a new request.
 * 
 * @param {object} data - The data for the new request.
 * @param {Transaction} transaction - The transaction object.
 * @returns {Promise<Request>} The newly created request.
 */
async function createRequest(data: any, transaction: Transaction) {
  const new_request = await Request.create(data, {
    transaction,
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  return new_request;
}

/**
 * Retrieves a request by its ID.
 * 
 * @param {number} id - The ID of the request.
 * @returns {Promise<Request>} The request with the given ID.
 */
async function getRequestById(id: number) {
  const request = await Request.findOne({
    where: {
      idRequest: id,
    },
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (!request) {
    throw errorHandler.createError(ErrorType.NO_REQUEST);
  }
  return request;
}

export { Request, createRequest, getRequestById };
