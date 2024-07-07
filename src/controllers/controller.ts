import ErrorSender from "../utils/error_sender";
import ResponseSender from "../utils/response_sender";
import HttpStatusCode from "../utils/status_code"
import { ResponseFactory, ResponseType } from "../factory/resFactory";
import { SequelizeDB } from "../singleton/sequelize";
import { ErrorFactory, ErrorType } from "../factory/errFactory";
//import { myQueue } from '../singleton/queueManager';
import { Dataset } from '../models/dataset';
import { User } from "../models/users";
import { Request } from "../models/request";
import path from 'path';
import multer from 'multer';

const sendResponse = new ResponseSender()
const sendError = new ErrorSender()
const resFactory = new ResponseFactory()
const errFactory = new ErrorFactory();
const sequelize = SequelizeDB.getConnection();
const dataset_obj = new Dataset();
const user_obj = new User();
const request_obj = new Request();

export async function getAllDatasets(req: any, res: any) {
  try {
    sendResponse.send(res, HttpStatusCode.OK, await dataset_obj.getAllDataset(req.user));
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function createDatasets(req: any, res: any) {
  const transaction = await sequelize.transaction();
  const name_dataset = req.body["name"]
  const user = req.user;

  try{
    await createDatasets({
      name_dataset: name_dataset,
      id_creator: user.id_user,
    }, 
      transaction
    );

    var fs = require('fs');
    var dir = `/usr/app/Datasets/${user.username}/${name_dataset}`;
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    } else {
      await transaction.rollback();
      throw errFactory.createError(ErrorType.DATASET_ALREADY_EXIST);
    }

    await transaction.commit();
    const response = resFactory.createResponse(ResponseType.UPLOAD_DATASET)
    sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
      await transaction.rollback();
      sendError.send(res, error.code, error.message);
    }
}

export async function deleteDataset(req: any, res: any) {
  try {
    const dataset = await dataset_obj.getDatasetByName(req.body["name"], req.user);
    await dataset.deleteDataset();
    const response = resFactory.createResponse(ResponseType.DATASET_DELETED)
    sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function updateDataset(req: any, res: any) {
  try {
    const dataset = await dataset_obj.getDatasetByName(req.body["name"], req.user);
    await dataset.updateDataset(req);
    const response = resFactory.createResponse(ResponseType.DATASET_UPDATED)
    sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function upload(req: any, res: any) {

  try{
    var fs = require('fs');
  
    const dataset_name = req.body.name;
    const file = req.files[0];
    const user = req.user;

    const dataset = await dataset_obj.getDatasetByName(dataset_name, user);

    const dir = `/usr/app/Datasets/${user.username}/${dataset_name}`;

    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    const response = resFactory.createResponse(ResponseType.FILE_UPLOADED)
    sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
  
  
  /*

  var fs = require('fs');

  // Configurazione di multer
  //const storage = multer.memoryStorage(); // Usa memoryStorage per evitare di salvare il file direttamente
  //const upload = multer({ storage: storage }).single('dataset');
  const upload = multer().single('dataset');
    
  upload(req, res, () => {
    const dataset_name = req.body.name;
    const file = req.file;
    const user = req.user;

    if (!file || !dataset_name) {
      return res.status(400).send('Missing file or dataset name');
    }

    const dir = `/usr/app/Datasets/${user.username}/${dataset_name}`;

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    res.send('File and JSON received successfully!');
  });
  */
}

export async function inference(req: any, res: any) {
  
  const transaction = await SequelizeDB.getConnection().transaction();
  //validate_body(req.body)
  const name_dataset = req.body["name"];
  const model = req.body["model"];
  const cam_det = req.body["cam_det"];
  const cam_cls = req.body["cam_cls"]; 
  
  try {
    const user = await user_obj.getUserByUsername(req.username);
    const dataset = await dataset_obj.getDatasetByName(name_dataset, user);
    
    var fs = require('fs');
    var dir = `/usr/app/Datasets/${user.username}/${dataset.name_dataset}`;
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      throw errFactory.createError(ErrorType.DATASET_EMPTY);
    }

    const request = {
      metadata: {
        operation: "inference",
        user: req.username
      },
      req_cost: 0, 
      timestamp: Date.now(),
      req_user: user.id_user,
      req_dataset: dataset.id_dataset
    };

    await request_obj.createRequest(request, transaction);

    if (user.tokens > request.req_cost) {
      const response: any = await fetch(`http://127.0.0.1:8000/inference`, {
        method: 'POST',
        body: JSON.stringify({
          user: user.username,
          dataset: dataset.name_dataset,
          model: model,
          cam_det: cam_det,
          cam_cls: cam_cls
        })
      });
      if (response.body !== null) {
        await request_obj.updateRequest(user.id_user, dataset.id_dataset, 'COMPLETED', transaction);
        sendResponse.send(res, HttpStatusCode.OK, {request: request, response: await response.json()})
      } else {
        await request_obj.updateRequest(user.id_user, dataset.id_dataset, 'FAILED', transaction);
        throw errFactory.createError(ErrorType.INFERENCE_FAILED);
      }
    } else {
      await request_obj.updateRequest(user.id_user, dataset.id_dataset, 'ABORTED', transaction);
      throw errFactory.createError(ErrorType.INFERENCE_ABORTED);
    }

  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }

}

/*
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