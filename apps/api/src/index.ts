import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import crypto from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import { env } from './config.js';
import { ensureBucket, s3 } from './s3.js';
import { imageQueue } from './queue.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true
});

await app.register(multipart, {
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB MVP
  }
});

app.get('/health', async () => ({ ok: true }));

// MVP: upload file -> store raw in S3 -> enqueue job -> return jobId
app.post('/api/jobs', async (req, reply) => {
  const mp = await req.file();
  if (!mp) return reply.code(400).send({ error: 'missing file field' });

  const jobId = crypto.randomUUID();
  const inputKey = `raw/${jobId}/${mp.filename}`;

  const buf = await mp.toBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: inputKey,
      Body: buf,
      ContentType: mp.mimetype
    })
  );

  await imageQueue.add('process-image', { jobId, inputKey });

  return reply.code(202).send({ jobId });
});

// Placeholder: status will come from DB later
app.get('/api/jobs/:jobId', async (req) => {
  const { jobId } = req.params as { jobId: string };
  return {
    jobId,
    status: 'queued',
    note: 'MVP skeleton: status is hardcoded until DB+worker update it.'
  };
});

await ensureBucket();

app.listen({ port: env.API_PORT, host: env.API_HOST });
