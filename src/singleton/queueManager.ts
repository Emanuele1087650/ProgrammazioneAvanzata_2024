import { Queue, Worker } from 'bullmq';
import { RedisOptions } from 'ioredis';

const connection: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const myQueue = new Queue('my-queue', { connection });

const worker = new Worker('my-queue', async (job) => {
  console.log(`Processing job ${job.id} with data`, job.data);
  // Simulazione di un processo di lavoro
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log(`Job ${job.id} completed`);
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error`, err);
});

worker.on('error', (err) => {
  console.error('Worker encountered an error', err);
});

export { myQueue };
