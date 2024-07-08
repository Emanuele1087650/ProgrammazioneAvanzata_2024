import { Worker, Job } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import { SequelizeDB } from '../singleton/sequelize';
import { User } from '../models/users';

const errFactory = new ErrorFactory();
const user_obj = new User();

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

const inferenceWorker = new Worker('inferenceQueue', async (job: Job) => {

    const { flag, user, dataset, model, cam_det, cam_cls } = job.data;
    if (flag) {
        const response: any = await fetch("http://cv:8000/inference", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                job_id: job.id,
                user: user.username,
                name: dataset.name_dataset,
                model: model,
                cam_det: cam_det,
                cam_cls: cam_cls
            })
        }).catch(() => {
            throw errFactory.createError(ErrorType.INFERENCE_FAILED);
        });
        if (response.body !== null) {
            const result = await response.json();
            return result;
        } else {
            throw errFactory.createError(ErrorType.INFERENCE_FAILED);
        }
    } else {
        return null;
    }
}, {
    connection: redisOptions,
    removeOnComplete: {
        age: 3600,
    },
    removeOnFail: {
        age: 3600,
    }
});
