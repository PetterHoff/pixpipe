import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from './config.js';

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  },
  forcePathStyle: env.S3_FORCE_PATH_STYLE
});

export async function getObjectBytes(key: string): Promise<Buffer> {
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key
    })
  );
  const body = res.Body;
  if (!body) throw new Error('S3 Body missing');

  // SDK v3: Body is a ReadableStream in Node
  const chunks: Buffer[] = [];
  for await (const chunk of body as any) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function putObjectBytes(key: string, bytes: Buffer, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: contentType
    })
  );
}
