import ErrorSender from "../utils/error_sender";
//import ResponseSender from "../utils/response_sender";
import HttpStatusCode from "../utils/status_code"
import { ResponseFactory, ResponseType } from "../factory/resFactory";
import { SequelizeDB } from "../singleton/sequelize";
import { ErrorFactory, ErrorType } from "../factory/errFactory";
import { Dataset } from '../models/dataset';
import { User } from "../models/users";
import path from 'path';
import { inferenceQueue } from '../queue/worker'; 
import { Job } from 'bullmq';
import { Readable } from 'stream'
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import AdmZip from 'adm-zip';
import mime from 'mime-types';
import unzipper from 'unzipper';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

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
      //await extractFramesFromVideo(content, name, dir)
  } else{
    throw errFactory.createError(ErrorType.BAD_REQUEST);
  }
  }
  return;
}

async function extractFramesFromVideo(videoBuffer: any, videoName: any, dir: any) {
    const videoStream = new Readable();
    videoStream.push(videoBuffer);
    videoStream.push(null);
    const command = ffmpeg(videoStream)
      .outputOptions('-vf', 'fps=1');
    return command;
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
    const count = {
      img_count: 0,
      frame_count: 0,
      zip_count: 0
    }

    if(file.mimetype === 'application/zip'){
      const zipBuffer = file.buffer;
    }

    if(file.mimetype.startsWith('image/')){
      count.img_count +=1;
    }
    if(file.mimetype === 'video/mp4') {
      let command = await extractFramesFromVideo(file.buffer, file.originalname, dir);
      let frameCount = 0;
      await new Promise<{frameCount: number, command: any}>((resolve, reject) => {
        command
          .output('/dev/null')
          .outputOptions('-f null')
          .on('progress', function(progress: any) {
            console.log("Progress update");
            frameCount = progress.frames;
            console.log(frameCount);
          })
          .on('end', () => {
            resolve({frameCount, command});
          })
          .on('error', (err: any) => {
            reject(err);
          })
          .run();
      });
      console.log("AOAOAOAOAOAOAOAO", frameCount)
    }
    resFactory.send(res, ResponseType.FILE_UPLOADED);
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
    if (job === undefined) {
      throw errFactory.createError(ErrorType.JOB_NOT_FOUND);
    }
    const { flag, user, dataset, model, cam_det, cam_cls } = job?.data;
    if (!flag) {
      resFactory.send(res, ResponseType.WORKER_ABORTED);
    } else if (await job.isCompleted()) {
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
  } catch (error: any) {
    sendError.send(res, error.code, error.message);
  }
}
