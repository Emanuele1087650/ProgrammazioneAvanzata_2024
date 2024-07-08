import ErrorSender from "../utils/error_sender";
import ResponseSender from "../utils/response_sender";
import HttpStatusCode from "../utils/status_code"
import { ResponseFactory, ResponseType } from "../factory/resFactory";
import { SequelizeDB } from "../singleton/sequelize";
import { ErrorFactory, ErrorType } from "../factory/errFactory";
import { Dataset } from '../models/dataset';
import { User } from "../models/users";
import { Request } from "../models/request";
import path from 'path';
import { inferenceQueue } from '../queue/queue';
import { Queue, Job } from 'bullmq';

const sendResponse = new ResponseSender();
const sendError = new ErrorSender();
const resFactory = new ResponseFactory();
const errFactory = new ErrorFactory();
const sequelize = SequelizeDB.getConnection();
const dataset_obj = new Dataset();
const user_obj = new User();

export async function getAllDatasets(req: any, res: any) {
  try {
    sendResponse.send(res, HttpStatusCode.OK, await dataset_obj.getAllDataset(req.user));
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function createDatasets(req: any, res: any) {
  const transaction = await sequelize.transaction();
  const name_dataset = req.body["name"];
  const user = req.user;

  try{
    await dataset_obj.createDataset({
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
    if (!fs.existsSync(dir)) {
      throw errFactory.createError(ErrorType.NO_DATASET_NAME);
    }

    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    const response = resFactory.createResponse(ResponseType.FILE_UPLOADED)
    sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function addQueue(req: any, res: any) {

  const transaction = await SequelizeDB.getConnection().transaction();
  const name_dataset = req.body["dataset"];
  const model = req.body["model"];
  const cam_det = req.body["cam_det"];
  const cam_cls = req.body["cam_cls"]; 
  
  try {
    const user = req.user;
    const dataset = await dataset_obj.getDatasetByName(name_dataset, user);

    var fs = require('fs');
    var dir = `/usr/app/Datasets/${user.username}/${dataset.name_dataset}`;
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      throw errFactory.createError(ErrorType.DATASET_EMPTY);
    }

    const flag = (user.tokens >= dataset.cost) ? true : false;
    const job = await inferenceQueue.add('inference', {
      flag,
      user,
      dataset,
      model,
      cam_det,
      cam_cls
    }).catch(() => {
      throw errFactory.createError(ErrorType.ADD_QUEUE_FAILED);
    });

    await user_obj.updateBalance(user.id_user, user.tokens - dataset.cost, transaction);
    await transaction.commit();
    res.status(HttpStatusCode.OK).json({message: "Inference added to queue", jobId: job.id})

  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function getJob(req: any, res: any) {
  const transaction = await SequelizeDB.getConnection().transaction();
  const jobId = req.body["jobId"];
  try {
    const job: Job | undefined = await inferenceQueue.getJob(jobId);
    const { flag, user, dataset, model, cam_det, cam_cls } = job?.data;
    if (!flag) {
      const response = resFactory.createResponse(ResponseType.WORKER_ABORTED)
      sendResponse.send(res, response.code, response.message);
    }
    if (job) {
      if (await job.isCompleted()) {
        sendResponse.send(res, HttpStatusCode.OK, {status: 'COMPLETED', result: await job.returnvalue});
      } else if (await job.isFailed()) {
        await user_obj.updateBalance(user.id_user, user.tokens, transaction);
        await transaction.commit();
        const response = resFactory.createResponse(ResponseType.WORKER_FAILED)
        sendResponse.send(res, response.code, response.message);
      } else if (await job.isActive()) {
        const response = resFactory.createResponse(ResponseType.WORKER_RUNNING)
        sendResponse.send(res, response.code, response.message);
      } else if (await job.isWaiting()) {
        const response = resFactory.createResponse(ResponseType.WORKER_PENDING)
        sendResponse.send(res, response.code, response.message);
      }
    } else {
      throw errFactory.createError(ErrorType.JOB_NOT_FOUND);
    }
  } catch (error: any) {
    sendError.send(res, error.code, error.message);
  }
}
