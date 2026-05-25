// S3 client setup for file uploads and documentation publishing.
//
// Exports two clients:
//   s3       — for server-side operations (putObject, deleteObject)
//   s3Client — for presigned URL generation (browser-facing)
//
// When S3_ENDPOINT is set, the backend talks to a local S3-compatible
// store (MinIO) instead of real AWS. Credentials come from the
// S3_ACCESS_KEY / S3_SECRET_KEY env vars.

import { S3Client, S3, S3ClientConfig } from "@aws-sdk/client-s3";
import { config } from "../../config";

const s3Endpoint = process.env.S3_ENDPOINT;
const s3PublicEndpoint = process.env.UPLOADS_CDN_URL;

const baseConfig: S3ClientConfig = {
  region: config.region,
  forcePathStyle: !!s3Endpoint,
  credentials: process.env.S3_ACCESS_KEY
    ? {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      }
    : undefined,
};

// Server-side operations use the internal Docker-network endpoint
// so the backend container can reach MinIO directly.
export const s3 = new S3({
  ...baseConfig,
  ...(s3Endpoint && { endpoint: s3Endpoint }),
});

// Presigned URLs use the public endpoint so browsers can POST uploads
// directly. Falls back to the internal endpoint, which works for real AWS
// where the SDK-generated URL is already browser-reachable.
export const s3Client = new S3Client({
  ...baseConfig,
  endpoint: s3PublicEndpoint || s3Endpoint || undefined,
});
