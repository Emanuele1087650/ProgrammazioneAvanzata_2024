import { Worker, Job, Queue } from 'bullmq';
import { Redis, RedisOptions } from 'ioredis';
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import { SequelizeDB } from '../singleton/sequelize';
import { getUserById, User } from '../models/users';
import { Request } from '../models/request';

const errFactory = new ErrorFactory();

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
  /**
   * Processes a job from the inference queue.
   *
   * @param {Job} job - The job to process.
   * @returns {Promise<Object>} The result of the inference or null.
   */
  async (job: Job) => {
    const { reqId, user, dataset, model, camDet, camCls } = job.data;
    const CV_HOST = process.env.CV_HOST;
    const CV_PORT = Number(process.env.CV_PORT);
    const response: Response = await fetch(
      `http://${CV_HOST}:${CV_PORT}/inference`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: reqId,
          user: user.username,
          name: dataset.nameDataset,
          model,
          camDet,
          camCls,
        }),
      },
    ).catch(() => {
      throw errFactory.createError(ErrorType.INFERENCE_FAILED);
    });
    if (response.body !== null) {
      const result = await response.json();
      return result;
    } else {
      throw errFactory.createError(ErrorType.INFERENCE_FAILED);
    }
  },
  {
    connection: redisOptions,
  },
);

export { inferenceQueue };

inferenceWorker.on(
  'completed',
  /**
   * Handles the 'completed' event of the inference worker.
   *
   * @param {Job} job - The completed job.
   * @returns {Promise<void>}
   */
  async (job) => {
    const userId = job.data.user.idUser;
    await Request.update(
      { status: 'COMPLETED', results: job.returnvalue },
      { where: { idRequest: job.data.reqId } },
    );
  },
);

inferenceWorker.on(
  'failed',
  /**
   * Handles the 'failed' event of the inference worker.
   *
   * @param {Job} job - The failed job.
   * @returns {Promise<void>}
   */
  async (job) => {
    await Request.update(
      { status: 'FAILED' },
      { where: { idRequest: job?.data.reqId } },
    );
    const transaction = await SequelizeDB.getConnection().transaction();
    const user: User = await getUserById(job?.data.user.idUser);
    const dataset = job?.data.dataset;
    await user.addTokens(dataset.cost, transaction).catch(async () => {
      await transaction.rollback();
    });
    await transaction.commit();
  },
);

inferenceWorker.on(
  'active',
  /**
   * Handles the 'active' event of the inference worker.
   *
   * @param {Job} job - The active job.
   * @returns {Promise<void>}
   */
  async (job) => {
    await Request.update(
      { status: 'RUNNING' },
      { where: { idRequest: job.data.reqId } },
    );
  }
);
