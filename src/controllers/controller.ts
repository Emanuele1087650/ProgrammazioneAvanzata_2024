import ErrorSender from '../utils/error_sender';
import { ResponseFactory, ResponseType } from '../factory/resFactory';
import { SequelizeDB } from '../singleton/sequelize';
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import { Dataset, createDataset, getAllDataset, getDatasetByName } from '../models/dataset';
import path from 'path';
import { inferenceQueue } from '../queue/worker';
import { Job } from 'bullmq';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import AdmZip from 'adm-zip';
import mime from 'mime-types';
import * as fs from 'fs';
import { User } from '../models/users';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpegInstaller.path;

const sendError = new ErrorSender();
const resFactory = new ResponseFactory();
const errFactory = new ErrorFactory();
const sequelize = SequelizeDB.getConnection();

export async function getAllDatasets(req: any, res: any) {
  const user: User = req.user;
  try {
    resFactory.send(
      res,
      undefined,
      await getAllDataset(await user.getUserId()),
    );
  } catch (error: any) {
    sendError.send(res, error);
  }
}

export async function createDatasets(req: any, res: any) {
  const transaction = await sequelize.transaction();
  try {
    const name_dataset = req.body['name'];
    const user: User = req.user;
    await createDataset(
      {
        name_dataset: name_dataset,
        id_creator: await user.getUserId(),
      },
      transaction,
    );
    const dir = `/usr/app/Datasets/${await user.getUsername()}/${name_dataset}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    } else {
      throw errFactory.createError(ErrorType.DATASET_ALREADY_EXIST);
    }
    await transaction.commit();
    resFactory.send(res, ResponseType.UPLOAD_DATASET);
  } catch (error: any) {
    await transaction.rollback();
    sendError.send(res, error);
  }
}

export async function deleteDataset(req: any, res: any) {
  const transaction = await sequelize.transaction();
  try {
    const name_dataset = req.body['name'];
    const user: User = req.user;
    const dataset: Dataset = await getDatasetByName(
      name_dataset,
      await user.getUserId(),
    );
    await dataset.deleteDataset(transaction);
    await transaction.commit();
    resFactory.send(res, ResponseType.DATASET_DELETED);
  } catch (error: any) {
    await transaction.rollback();
    sendError.send(res, error);
  }
}

export async function updateDataset(req: any, res: any) {
  const transaction = await sequelize.transaction();
  try {
    const name_dataset = req.body['name'];
    const new_name = req.body['new_name'];
    const user: User = req.user;
    const dataset: Dataset = await getDatasetByName(
      name_dataset,
      await user.getUserId(),
    );
    await dataset.updateDataset(new_name, transaction);
    await transaction.commit();
    resFactory.send(res, ResponseType.DATASET_UPDATED);
  } catch (error: any) {
    await transaction.rollback();
    sendError.send(res, error);
  }
}

async function createUniqueName(originalName: any) {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${baseName}-${timestamp}`;
}

async function countAndVerifyZip(zipBuffer: any) {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();
  let img_count = 0;
  let video_count = 0;

  for (const zipEntry of zipEntries) {
    if (zipEntry.isDirectory) {
      throw errFactory.createError(ErrorType.BAD_REQUEST);
    }

    const mimetype = mime.lookup(zipEntry.entryName);

    if (!mimetype || mimetype.startsWith('image/')) {
      img_count++;
    } else if (!mimetype || mimetype === 'video/mp4') {
      const buffer = zipEntry.getData();
      video_count += await countFrame(buffer);
    } else {
      throw errFactory.createError(ErrorType.BAD_REQUEST);
    }
  }
  return { video_count, img_count };
}

async function extractZip(zipBuffer: any, dir: any) {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  for (const zipEntry of zipEntries) {
    const mimetype = mime.lookup(zipEntry.entryName);

    const buffer = zipEntry.getData();
    const name = zipEntry.name;
    const fileName = await createUniqueName(name);

    if (!mimetype || mimetype.startsWith('image/')) {
      const filePath = path.join(dir, `${fileName}.jpg`);
      fs.writeFileSync(filePath, buffer);
    } else if (!mimetype || mimetype === 'video/mp4') {
      const command = await extractFramesFromVideo(buffer);
      command.save(`${dir}/${fileName}-%03d.png`);
    } else {
      throw errFactory.createError(ErrorType.BAD_REQUEST);
    }
  }
  return;
}

async function saveFile(dir: any, file: any) {
  if (file.mimetype === 'video/mp4') {
    const fileName = await createUniqueName(file.originalname);
    const command = await extractFramesFromVideo(file.buffer);
    command.save(`${dir}/${fileName}-%03d.png`);
  } else if (file.mimetype === 'application/zip') {
    await extractZip(file.buffer, dir);
  } else if (file.mimetype.startsWith('image/')) {
    const fileName = await createUniqueName(file.originalname);
    const filePath = path.join(dir, `${fileName}.jpg`);
    fs.writeFileSync(filePath, file.buffer);
  } else {
    throw errFactory.createError(ErrorType.BAD_REQUEST);
  }
}

async function countFrame(buffer: any) {
  const command = await extractFramesFromVideo(buffer);
  let frame_count = 0;
  return new Promise<number>((resolve, reject) => {
    command
      .output('/dev/null')
      .outputOptions('-f null')
      .on('progress', function (progress: any) {
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
  const command = ffmpeg(videoStream).outputOptions('-vf', 'fps=1');
  return command;
}

export async function upload(req: any, res: any) {
  const transaction = await sequelize.transaction();
  const transaction2 = await sequelize.transaction();

  try {
    const dataset_name = req.body.name;
    const files = req.files;
    const user: User = req.user;
    const dataset: Dataset = await getDatasetByName(
      dataset_name,
      await user.getUserId(),
    );
    const dir = `/usr/app/Datasets/${await user.getUsername()}/${dataset_name}`;
    if (!fs.existsSync(dir)) {
      throw errFactory.createError(ErrorType.NO_DATASET_NAME);
    }
    const count = {
      img_count: 0,
      frame_count: 0,
      zip_img: 0,
      zip_video: 0,
    };
    for (const file of files) {
      if (file.mimetype === 'application/zip') {
        const { video_count, img_count } = await countAndVerifyZip(file.buffer);
        count.zip_video += video_count;
        count.zip_img += img_count;
      }
      if (file.mimetype.startsWith('image/')) {
        count.img_count += 1;
      }
      if (file.mimetype === 'video/mp4') {
        count.frame_count += await countFrame(file.buffer);
      }
    }
    const upload_cost =
      count.frame_count * 0.4 +
      count.img_count * 0.65 +
      count.zip_img * 0.7 +
      count.zip_video * 0.7;
    if (upload_cost > (await user.getBalance())) {
      throw errFactory.createError(ErrorType.INSUFFICIENT_BALANCE);
    }
    const inference_cost =
      (count.frame_count + count.zip_video) * 1.5 +
      (count.img_count + count.zip_img) * 2.75;
    const dataset_cost = await dataset.getCost();

    await user.removeTokens(upload_cost, transaction);
    await dataset.updateCost(dataset_cost + inference_cost, transaction2);
    for (const file of files) {
      await saveFile(dir, file);
    }
    await transaction.commit();
    await transaction2.commit();
    resFactory.send(res, ResponseType.FILE_UPLOADED);
  } catch (error: any) {
    await transaction.rollback();
    await transaction2.rollback();
    sendError.send(res, error);
  }
}

export async function addQueue(req: any, res: any) {
  const transaction = await sequelize.transaction();
  try {
    const name_dataset = req.body['dataset'];
    const model = req.body['model'];
    const cam_det = req.body['cam_det'];
    const cam_cls = req.body['cam_cls'];
    const user: User = req.user;
    const dataset = await getDatasetByName(
      name_dataset,
      await user.getUserId(),
    );
    const dir = `/usr/app/Datasets/${await user.getUsername()}/${name_dataset}`;
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      throw errFactory.createError(ErrorType.DATASET_EMPTY);
    }
    let flag: boolean;
    const dataset_cost = await dataset.getCost();
    if ((await user.getBalance()) >= dataset_cost) {
      await user.removeTokens(dataset_cost, transaction);
      await transaction.commit();
      flag = true;
    } else {
      flag = false;
    }
    const job = await inferenceQueue
      .add('inference', {
        flag,
        user,
        dataset,
        model,
        cam_det,
        cam_cls,
      })
      .catch(() => {
        throw errFactory.createError(ErrorType.ADD_QUEUE_FAILED);
      });
    resFactory.send(res, undefined, {
      message: 'Inference added to queue',
      jobId: job.id,
    });
  } catch (error: any) {
    await transaction.rollback();
    sendError.send(res, error);
  }
}

async function checkJobOwner(job: any, user: User) {
  if ((await user.getUserId()) === job.data.user.id_user) {
    return;
  } else {
    throw errFactory.createError(ErrorType.NOT_OWNER_JOB);
  }
}

export async function getJob(req: any, res: any) {
  try {
    const jobId = req.body['jobId'];
    const job: Job | undefined = await inferenceQueue.getJob(jobId);
    if (job === undefined) {
      throw errFactory.createError(ErrorType.JOB_NOT_FOUND);
    }
    await checkJobOwner(job, req.user);
    const flag = job.data.flag;
    if (!flag) {
      resFactory.send(res, ResponseType.ABORTED);
    } else if (await job.isCompleted()) {
      resFactory.send(res, undefined, {
        status: 'COMPLETED',
        results: await job.returnvalue,
      });
    } else if (await job.isFailed()) {
      resFactory.send(res, ResponseType.FAILED);
    } else if (await job.isActive()) {
      resFactory.send(res, ResponseType.RUNNING);
    } else if (await job.isWaiting()) {
      resFactory.send(res, ResponseType.PENDING);
    } else {
      throw errFactory.createError(ErrorType.INTERNAL_ERROR);
    }
  } catch (error: any) {
    sendError.send(res, error);
  }
}

export async function getResults(req: any, res: any) {
  const jobId = req.body['jobId'];
  try {
    const job: Job | undefined = await inferenceQueue.getJob(jobId);
    if (job === undefined) {
      throw errFactory.createError(ErrorType.JOB_NOT_FOUND);
    }
    const flag = job.data.flag;
    await checkJobOwner(job, req.user);
    if ((await job.isCompleted()) && flag) {
      resFactory.send(res, undefined, {
        status: 'COMPLETED',
        result: await job.returnvalue,
      });
    } else {
      throw errFactory.createError(ErrorType.NOT_COMPLETED_JOB);
    }
  } catch (error: any) {
    sendError.send(res, error);
  }
}

export async function getTokens(req: any, res: any) {
  const user: User = req.user;
  const tokens = await user.getBalance();
  resFactory.send(res, undefined, { tokens: tokens });
}

export async function recharge(req: any, res: any) {
  const transaction = await sequelize.transaction();
  try {
    const user: User = req.user;
    const tokens = req.body['tokens'];
    await user.addTokens(tokens, transaction);
    transaction.commit();
    resFactory.send(res, ResponseType.RECHARGED);
  } catch (error: any) {
    await transaction.rollback();
    sendError.send(res, error);
  }
}
