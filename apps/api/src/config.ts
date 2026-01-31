import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  DATABASE_URL: z.string().optional(),

  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().default('minio'),
  S3_SECRET_ACCESS_KEY: z.string().default('minioadmin'),
  S3_BUCKET: z.string().default('pixpipe'),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

  PUBLIC_BASE_URL: z.string().default('http://localhost:3001')
});

export const env = envSchema.parse(process.env);
