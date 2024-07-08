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
import { Readable } from 'stream'
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import AdmZip from 'adm-zip';
import mime from 'mime-types';

import unzipper from 'unzipper';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const sendResponse = new ResponseSender();
const sendError = new ErrorSender();
const resFactory = new ResponseFactory();
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


async function extractAndVerifyZip(zipBuffer: any, dir: any) {
  /*
  // Converte il buffer in uno stream leggibile
  const zipStream = Readable.from(zipBuffer);

  const directory = await unzipper.Open.buffer(zipBuffer);

  for (const file of directory.files) {
    if (file.type === 'File') {
      console.log(file)
      const content = await file.buffer();
      const filePath = path.join(dir, file.path);
      //fs.writeFileSync(filePath, content);
    }
  }

  //return;
  */
  

  const zip = new AdmZip(zipBuffer);

  // Estrai tutte le voci del ZIP
  const zipEntries = zip.getEntries();

  for (const zipEntry of zipEntries) {
    if (zipEntry.isDirectory) {
      // Se ci sono directory, lancia un errore
      throw new Error('Il file ZIP non deve contenere directory.');
    }

    // Ottieni il tipo MIME del file
    const mimetype = mime.lookup(zipEntry.entryName);

    // Verifica che il tipo MIME sia un'immagine o un video
    if (!mimetype || (!mimetype.startsWith('image/') && !(mimetype === 'video/mp4'))) {
      throw new Error('Il file ZIP contiene file che non sono né immagini né video.');
    }
  }

  for (const zipEntry of zipEntries) {
    const mimetype = mime.lookup(zipEntry.entryName);
    

    // Ottieni il contenuto del file come buffer
    const content = zipEntry.getData();
    const name = zipEntry.name;

    if (!mimetype || mimetype.startsWith('image/')) {
      //console.log(zipEntry)
    const filePath = path.join(dir, name);

    // Scrivi il file nel file system
    fs.writeFileSync(filePath, content);
    }else if (!mimetype || mimetype === 'video/mp4') {
      await extractFramesFromVideo(content, name, dir);
  } else{
    throw errFactory.createError(ErrorType.BAD_REQUEST);
  }
  }
  return;
}

async function saveFile(fs: any, dir: any, file: any){

  if(file.mimetype === 'video/mp4'){
    await extractFramesFromVideo(file.buffer, file.originalname, dir);
  } else if(file.mimetype === 'application/zip'){
    await extractAndVerifyZip(file.buffer, dir);
  } else {
    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
  }
}

async function extractFramesFromVideo(videoBuffer: any, videoName: any, dir: any) {
    // Creiamo un Readable stream dal buffer
    const videoStream = new Readable();
    videoStream.push(videoBuffer);
    videoStream.push(null);

    // Estrai i frame dal video stream
    ffmpeg(videoStream)
        .fps(1)
        .on('end', () => {
            return;
        })
        .on('error', (err: Error) => {
          throw errFactory.createError(ErrorType.INTERNAL_ERROR);
        })
        .save(`${dir}/${videoName}-%03d.png`); 
    return;
}

export async function upload(req: any, res: any) {

  var fs = require('fs');

  try{
    const dataset_name = req.body.name;
    const file = req.files[0];
    const user = req.user;

    const dataset = await dataset_obj.getDatasetByName(dataset_name, user);

    const dir = `/usr/app/Datasets/${user.username}/${dataset_name}`;
    if (!fs.existsSync(dir)) {
      throw errFactory.createError(ErrorType.NO_DATASET_NAME);
    }
    
    await saveFile(fs, dir, file);
    
    /*
    if(file.mimetype === 'application/zip'){
      const zipBuffer = file.buffer;
      const files = await extractAndVerifyZip (zipBuffer);
      for (const file_to_save of files){
        await saveFile(fs, dir, file_to_save);
      }
    }else {await saveFile(fs, dir, file);}
    */
    

    const response = resFactory.createResponse(ResponseType.FILE_UPLOADED)
    sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function addQueue(req: any, res: any) {
  
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

    const job = await inferenceQueue.add('inference', {
      user,
      name_dataset,
      model,
      cam_det,
      cam_cls
    }).catch(() => {
      throw errFactory.createError(ErrorType.ADD_QUEUE_FAILED);
    });

    res.status(HttpStatusCode.OK).json({message: "Inference added to queue", jobId: job.id})

  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function getJob(req: any, res: any) {

  const jobId = req.body["jobId"];
  try {
    const job: Job | undefined = await inferenceQueue.getJob(jobId);
    if (job) {
      if (await job.isCompleted()) {
        const result = await job.returnvalue;
        res.status(200).send({ status: 'COMPLETED', result });
      } else if (await job.isFailed()) {
        res.status(200).send({ status: 'FAILED', error: job.failedReason });
      } else {
        res.status(200).send({ status: await job.getState() });
      }
    } else {
      throw errFactory.createError(ErrorType.JOB_NOT_FOUND);
    }
  } catch (error: any) {
    sendError.send(res, error.code, error.message);
  }
}
