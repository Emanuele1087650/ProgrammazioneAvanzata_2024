import { getAllUser, getUserByUsername } from "../models/users";
import ErrorSender from "../utils/error_sender";
import ResponseSender from "../utils/response_sender";
import HttpStatusCode from "../utils/status_code"
import { ResponseFactory, ResponseType } from "../factory/resFactory";
import { createRequest, Request, updateRequest } from "../models/request";
import { SequelizeDB } from "../singleton/sequelize";
import { Dataset, getDatasetById, getDatasetsByUser } from "../models/datasets";
import { ErrorFactory, ErrorType } from "../factory/errFactory";
//import { myQueue } from '../singleton/queueManager';

const sendResponse = new ResponseSender()
const sendError = new ErrorSender()
const resFactory = new ResponseFactory()
const errorHandler = new ErrorFactory();

export async function getAllDatasets(req: any, res: any) {
  try {
    sendResponse.send(res, HttpStatusCode.OK, await getAllUser());
    //const response = resFactory.createResponse(ResponseType.NO_AUTH_HEADER)
    //sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
      try {
            sendResponse.send(res, HttpStatusCode.OK, await getAllUser());
      } catch(error: any) {
            sendError.send(res, error.code, error.message);
      }
}

export async function createDataset(req: any, res: any) {
  const transaction = await SequelizeDB.getConnection().transaction();
  const name_dataset = req.body["name"]

  try {
    const user: any = await getUserByUsername(req.username)

    const data = {
      name_dataset: name_dataset,
      id_creator: user.id_user
    }

    await Dataset.create(data, 
    { 
      transaction: transaction 
    }).catch(async () => {
      await transaction.rollback();
      throw errorHandler.createError(ErrorType.BAD_REQUEST); 
    });
    await transaction.commit();
    
    var fs = require('fs');
    var dir = `/usr/app/Datasets/${user.username}/${name_dataset}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    } else {
      throw errorHandler.createError(ErrorType.DATASET_ALREADY_EXIST);
    }

    const response = resFactory.createResponse(ResponseType.UPLOAD_DATASET)
    sendResponse.send(res, response.code, response.message);

  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

/*
export async function per_dopo (req: any, res: any) {
  
  const transaction = await SequelizeDB.getConnection().transaction();
  //validate_body(req.body)
  const name_dataset = req.body["name"]

  try {
    const user: any = await getUserByUsername(req.username)

    const request = {
      metadata: {
        operation: "Create dataset",
        user: req.username
      },
      req_cost: 0, 
      timestamp: Date.now(),
      req_user: user.id_user
    };

    const data = {
      name_dataset: name_dataset,
      id_creator: user.id_user
    }

    await createRequest(request, transaction).catch(() => {
      throw errorHandler.createError(ErrorType.BAD_REQUEST); 
    });

    await Dataset.create(data, 
    { 
      transaction: transaction 
    }).catch(async () => {
      await updateRequest(user.id_user, dataset.id_dataset, "FAILED", transaction)
      throw errorHandler.createError(ErrorType.BAD_REQUEST); 
    });

    await transaction.commit();
    const transaction2 = await SequelizeDB.getConnection().transaction();


    const dataset: any = await getDatasetsByUser(user.id_user, name_dataset).catch(() => {
      throw errorHandler.createError(ErrorType.NO_AUTH_HEADER);
    });
    
    var fs = require('fs');
    var dir = `/usr/app/Datasets/${user.username}/${dataset.name}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    //await updateRequest(user.id_user, dataset.id_dataset, "COMPLETED", transaction2);
    await Request.update({
      req_status: "COMPLETED"
    }, {
      where: {
        id_user: user.id_user,
        id_dataset: dataset.id_dataset
      },
      transaction: transaction2
    }).catch(() => {
      throw errorHandler.createError(ErrorType.BAD_REQUEST); 
    });

    const response = resFactory.createResponse(ResponseType.UPLOAD_DATASET)
    sendResponse.send(res, response.code, response.message);

  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }

}

export const addJob = async (req: Request, res: Response) => {
  try {
    const jobData = req.body;
export const addJob = async (req: Request, res: Response) => {
  } catch (error) {
    res.status(500).json({ message: 'Failed to add job to queue', error });
  }
}; 
}; 
*/