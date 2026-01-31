import { Queue } from 'bullmq';
import { env } from './config.js';

export const IMAGE_QUEUE_NAME = 'image-jobs';

export const imageQueue = new Queue(IMAGE_QUEUE_NAME, {
  connection: {
    url: env.REDIS_URL
  }
});

export type ImageJobPayload = {
  jobId: string;
  inputKey: string;
  // future: operations, userId, etc.
};
