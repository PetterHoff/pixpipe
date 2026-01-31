import { Worker } from 'bullmq';
import sharp from 'sharp';

import { env } from './config.js';
import { getObjectBytes, putObjectBytes } from './s3.js';

const IMAGE_QUEUE_NAME = 'image-jobs';

type ImageJobPayload = {
  jobId: string;
  inputKey: string;
};

const worker = new Worker<ImageJobPayload>(
  IMAGE_QUEUE_NAME,
  async (job) => {
    const { jobId, inputKey } = job.data;

    const input = await getObjectBytes(inputKey);

    // MVP: generate one thumbnail (512px wide) as JPEG
    const thumb = await sharp(input)
      .rotate() // auto-orient
      .resize({ width: 512 })
      .jpeg({ quality: 82 })
      .toBuffer();

    const outputKey = `thumb/${jobId}/thumb.jpg`;
    await putObjectBytes(outputKey, thumb, 'image/jpeg');

    return { outputKey };
  },
  {
    connection: { url: env.REDIS_URL }
  }
);

worker.on('completed', (job, result) => {
  console.log(`[worker] completed job ${job.id}`, result);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] failed job ${job?.id}`, err);
});

console.log('[worker] started');
