import { SequelizeDB } from "../singleton/sequelize";
import { DataTypes, Transaction } from "sequelize";
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
      defaultValue: "PENDING",
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

export async function getRequestById(id_request: number) {
  const request = await Request.findByPk(id_request, {
    raw: true,
  });
  if (!request) {
    throw new Error(`Request with id ${id_request} not found`);
  }
  return request;
}

export async function updateRequest(id_user: number, id_dataset: number, req_status: string, transaction: Transaction) {
  try {
    await Request.update({
      req_status: req_status
    }, {
      where: {
        id_user: id_user,
        id_dataset: id_dataset
      },
      transaction: transaction
    });
  } catch {
    throw new Error('Error during request update');
  }
}

export async function getAllRequest() {
  const requests = await Request.findAll()
  if(!requests) {
    throw new Error('No requests found');
  }
}

export async function getRequestByUser(id_user: number) {
  const requests = await Request.findAll({
    where: {
      req_user: id_user
    },
    raw: true,
  });
  if (!requests) {
    throw new Error(`Request with id ${id_user} not found`);
  }
  return requests;
}

export async function getRequestByDataset(id_dataset: number) {
  const requests = await Request.findAll({
    where: {
      req_dataset: id_dataset
    },
    raw: true,
  });
  if (!requests) {
    throw new Error(`Request with id ${id_dataset} not found`);
  }
  return requests;
}

export async function getRequestByUserOnDataset(id_user: number, id_dataset: number) {
  const requests = await Request.findAll({
    where: {
      req_user: id_user,
      req_dataset: id_dataset
    },
    raw: true,
  });
  if (!requests) {
    throw new Error(`Request with user ${id_user} and dataset ${id_dataset} not found`);
  }
  return requests;
}

export async function createRequest(request: any, transaction: Transaction) {
  await Request.create(request, 
    { 
      transaction: transaction 
    }
  ).catch((error) => {
    error;
  });
}

export async function createDataset(user: any, dataset: any, request: any, transaction: Transaction) {
  await createRequest(request, transaction);
  if (user.tokens > request.req_cost) {
    await Dataset.create(dataset, 
      { 
        transaction: transaction 
      }
    ).catch(async () => {
      await updateRequest(user.id_user, dataset.id_dataset, 'FAILED', transaction);
    });
  }
  await updateRequest(user.id_user, dataset.id_dataset, 'COMPLETED', transaction) 
}

export async function inference(user: any, dataset: any, request: any, model?: string, cam_det?: boolean, cam_cls?: boolean, transaction: Transaction) {
  await createRequest(request, transaction);
  if (user.tokens > request.req_cost) {
    const response = await fetch(`http://127.0.0.1:8000/inference/${user.username}/${dataset.name}/${model}/${cam_det}/${cam_cls}` {
      method: 'POST',
    });
    if (response.body !== null) {
      await updateRequest(user.id_user, dataset.id_dataset, 'COMPLETED', transaction) 
      return response
    }
  }
  await updateRequest(user.id_user, dataset.id_dataset, 'ABORTED', transaction) 
}
