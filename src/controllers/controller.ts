import ErrorSender from "../utils/error_sender";
//import ResponseSender from "../utils/response_sender";
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
import { Readable, PassThrough, Writable } from 'stream'
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import AdmZip from 'adm-zip';
import mime from 'mime-types';

import unzipper from 'unzipper';
import { Transaction } from "sequelize";

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

//const sendResponse = new ResponseSender();
const sendError = new ErrorSender();
const resFactory = new ResponseFactory();
const errFactory = new ErrorFactory();
const sequelize = SequelizeDB.getConnection();
const dataset_obj = new Dataset();
const user_obj = new User();

export async function getAllDatasets(req: any, res: any) {
  try {
    resFactory.send(res, undefined, await dataset_obj.getAllDataset(req.user));
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
    resFactory.send(res, ResponseType.UPLOAD_DATASET);
  } catch(error: any) {
      await transaction.rollback();
      sendError.send(res, error.code, error.message);
    }
}

export async function deleteDataset(req: any, res: any) {
  try {
    const dataset = await dataset_obj.getDatasetByName(req.body["name"], req.user);
    await dataset.deleteDataset();
    resFactory.send(res, ResponseType.DATASET_DELETED);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function updateDataset(req: any, res: any) {
  try {
    const dataset = await dataset_obj.getDatasetByName(req.body["name"], req.user);
    await dataset.updateDataset(req);
    resFactory.send(res, ResponseType.DATASET_UPDATED);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}


async function countAndVerifyZip(zipBuffer: any) {  

  const zip = new AdmZip(zipBuffer);

  // Estrai tutte le voci del ZIP
  const zipEntries = zip.getEntries();
  let img_count = 0;
  let video_count = 0;

  for (const zipEntry of zipEntries) {
    if (zipEntry.isDirectory) {
      // Se ci sono directory, lancia un errore
      throw errFactory.createError(ErrorType.BAD_REQUEST);;
    }

    // Ottieni il tipo MIME del file
    const mimetype = mime.lookup(zipEntry.entryName);
    console.log(mimetype)

    // Verifica che il tipo MIME sia un'immagine o un video
    if (!mimetype || (mimetype.startsWith('image/'))){
      img_count++; 
    } else if(!mimetype || (mimetype === 'video/mp4')) {
      const content = zipEntry.getData();
      video_count += await countFrame(content);
      }else {
      throw errFactory.createError(ErrorType.BAD_REQUEST);
    }
  }
  return {video_count, img_count};
}

async function extractAndVerifyZip(zipBuffer: any, dir: any) {  

  const zip = new AdmZip(zipBuffer);

  // Estrai tutte le voci del ZIP
  const zipEntries = zip.getEntries();

  for (const zipEntry of zipEntries) {
    const mimetype = mime.lookup(zipEntry.entryName);
    
    // Ottieni il contenuto del file come buffer
    const content = zipEntry.getData();
    const name = zipEntry.name;

    if (!mimetype || mimetype.startsWith('image/')) {
      const filePath = path.join(dir, name);
      fs.writeFileSync(filePath, content);
    }else if (!mimetype || mimetype === 'video/mp4') {
      let command = await extractFramesFromVideo(content);
      command.save(`${dir}/${name}-%03d.png`);
  } else{
    throw errFactory.createError(ErrorType.BAD_REQUEST);
  }
  }
  return;
}

async function saveFile(fs: any, dir: any, file: any){
    if(file.mimetype === 'video/mp4'){
    let command = await extractFramesFromVideo(file.buffer);
    command.save(`${dir}/${file.originalname}-%03d.png`);
  } else if(file.mimetype === 'application/zip'){
    await extractAndVerifyZip(file.buffer, dir);
  } else if (file.mimetype.startsWith('image/')){
    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
  } else {
    throw errFactory.createError(ErrorType.BAD_REQUEST);
  }
}

async function countFrame (buffer: any){
  let command = await extractFramesFromVideo(buffer);
  let frame_count = 0
  return new Promise<number>((resolve, reject) => {
    command
      .output('/dev/null')
      .outputOptions('-f null')
      .on('progress', function(progress: any) {
        frame_count = progress.frames;
      })
      .on('end', () => {
        resolve(frame_count);
      })
      .on('error', (err: any) => {
        reject(err);
      })
      .run();
  });
}

async function extractFramesFromVideo(videoBuffer: any) {
  const videoStream = new Readable();
  videoStream.push(videoBuffer);
  videoStream.push(null);

  const command = ffmpeg(videoStream)
    .outputOptions('-vf', 'fps=1')
  return command
}

export async function upload(req: any, res: any) {
  var fs = require('fs');
  const transaction2 = await sequelize.transaction();
  const transaction = await sequelize.transaction();

  try {
      const dataset_name = req.body.name;
      const file = req.files[0];
      const user = req.user;

      const dataset = await dataset_obj.getDatasetByName(dataset_name, user);

      const dir = `/usr/app/Datasets/${user.username}/${dataset_name}`;
      if (!fs.existsSync(dir)) {
          throw errFactory.createError(ErrorType.NO_DATASET_NAME);
      }

      const count = {
          img_count: 0,
          frame_count: 0,
          zip_img: 0,
          zip_video: 0
      };

      if (file.mimetype === 'application/zip') {
        const zipBuffer = file.buffer;
        let {video_count, img_count} = await countAndVerifyZip(zipBuffer);
        count.zip_video += video_count;
        count.zip_img += img_count;
      }
      if (file.mimetype.startsWith('image/')) {
          count.img_count += 1;
      }
      if (file.mimetype === 'video/mp4') {
        count.frame_count += await countFrame(file.buffer);
      }

      let upload_price = (count.frame_count * 0.4) + (count.img_count * 0.65) + (count.zip_img * 0.7) + (count.zip_video * 0.7)
      
      if (upload_price > user.tokens){
        throw errFactory.createError(ErrorType.INSUFFICIENT_BALANCE);
      }

      let inference_cost = ((count.frame_count + count.zip_video) * 1.5) + ((count.img_count + count.zip_img) * 2.75)

      await user_obj.updateBalance(user.id_user, user.tokens - upload_price, transaction);

      await dataset.updateCost(dataset.cost + inference_cost, transaction2);

      await saveFile(fs, dir, file);
      await transaction.commit();
      await transaction2.commit();

      resFactory.send(res, ResponseType.FILE_UPLOADED);
  } catch (error: any) {
      transaction.rollback();
      transaction2.rollback();
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
    let flag: boolean;
    if (user.tokens >= dataset.cost) {
      const transaction = await sequelize.transaction();
      await user_obj.updateBalance(user.id_user, user.tokens - dataset.cost, transaction);
      await transaction.commit();
      flag = true;
    } else {
      flag = false
    }
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
    resFactory.send(res, undefined, {message: "Inference added to queue", jobId: job.id})
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export async function getJob(req: any, res: any) {
  const jobId = req.body["jobId"];
  try {
    const job: Job | undefined = await inferenceQueue.getJob(jobId);
    const { flag, user, dataset, model, cam_det, cam_cls } = job?.data;
    if (!flag) {
      resFactory.send(res, ResponseType.WORKER_ABORTED);
    } else if (job) {
      if (await job.isCompleted()) {
        resFactory.send(res, undefined, {status: 'COMPLETED', result: await job.returnvalue});
      } else if (await job.isFailed()) {
        const transaction = await SequelizeDB.getConnection().transaction();
        await user_obj.updateBalance(user.id_user, user.tokens, transaction);
        await transaction.commit();
        resFactory.send(res, ResponseType.WORKER_FAILED); 
      } else if (await job.isActive()) {
        resFactory.send(res, ResponseType.WORKER_RUNNING);
      } else if (await job.isWaiting()) {
        resFactory.send(res, ResponseType.WORKER_PENDING);
      } else {
        throw errFactory.createError(ErrorType.INTERNAL_ERROR);
      }
    } else {
      throw errFactory.createError(ErrorType.JOB_NOT_FOUND);
    }
  } catch (error: any) {
    sendError.send(res, error.code, error.message);
  }
}
