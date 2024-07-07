import { Worker, Job } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { ErrorFactory, ErrorType } from '../factory/errFactory';

const errFactory = new ErrorFactory();

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

const inferenceWorker = new Worker('inferenceQueue', async (job: Job) => {
    const { user, name_dataset, model, cam_det, cam_cls } = job.data;
    console.log(job.data)
    const response: any = await fetch("http://127.0.0.1:8000/inference", {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: user.username,
            name: name_dataset,
            model: model,
            cam_det: cam_det,
            cam_cls: cam_cls
        })
        }).catch(() => {
            throw errFactory.createError(ErrorType.RECHARGE_FAIL);
        });
        if (response.body !== null) {
            const result = await response.json();
            return result;
        } else {
            throw errFactory.createError(ErrorType.INFERENCE_FAILED);
        }
}, {
    connection: redisOptions,
});
