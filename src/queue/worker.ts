import { Worker, Job, Queue } from 'bullmq';
import { Redis, RedisOptions } from 'ioredis';
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import { SequelizeDB } from '../singleton/sequelize';
import { getUserById, User } from '../models/users';

const errFactory = new ErrorFactory();
const MAX_COMPLETED_JOBS_PER_USER = 50;

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

const redis = new Redis(redisOptions);

const inferenceQueue = new Queue('inferenceQueue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: false,
  },
});

const inferenceWorker = new Worker(
  'inferenceQueue',
  async (job: Job) => {
    const { flag, user, dataset, model, cam_det, cam_cls } = job.data;
    if (flag) {
      const response: Response = await fetch('http://cv:8000/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: job.id,
          user: user.use,
          name: dataset.name_dataset,
          model: model,
          cam_det: cam_det,
          cam_cls: cam_cls,
        }),
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
  },
  {
    connection: redisOptions,
  },
);

export { inferenceQueue };

inferenceWorker.on('completed', async (job) => {
  const userId = job.data.user.id_user;

  const userJobCount = await redis.incr(`user:${userId}:completedJobCount`);

  if (userJobCount > MAX_COMPLETED_JOBS_PER_USER) {
    const userJobs = await inferenceQueue.getJobs(['completed'], 0, -1, true);
    const oldestUserJob = userJobs.find((j) => j.data.user.id_user === userId);
    if (oldestUserJob) {
      await oldestUserJob.remove();
      await redis.decr(`user:${userId}:completedJobCount`);
    }
  }
});

inferenceWorker.on('failed', async (job) => {
  const transaction = await SequelizeDB.getConnection().transaction();
  const user: User = await getUserById(job?.data.user.id_user);
  const dataset = job?.data.dataset;
  await user.addTokens(dataset.cost, transaction).catch(async () => {
    await transaction.rollback();
  });
  await transaction.commit();
});
