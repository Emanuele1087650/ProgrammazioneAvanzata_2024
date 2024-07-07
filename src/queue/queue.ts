import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),     
};

const inferenceQueue = new Queue('inferenceQueue', {
  connection: redisOptions,
});

export { inferenceQueue };
