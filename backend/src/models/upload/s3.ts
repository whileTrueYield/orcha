// S3 client setup for file uploads and documentation publishing.
//
// Exports two clients:
//   s3       — for server-side operations (putObject, deleteObject)
//   s3Client — for presigned URL generation (browser-facing)
//
// When ORCHA_S3_ENDPOINT is set, the backend talks to a local
// S3-compatible store (MinIO) instead of real AWS. Credentials come from
// the standard AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars — set
// them to the MinIO root user for dev, or real AWS creds for prod.

import { S3Client, S3, S3ClientConfig } from "@aws-sdk/client-s3";
import { config } from "../../config";

const s3Endpoint = process.env.ORCHA_S3_ENDPOINT;
const s3PublicEndpoint = process.env.ORCHA_S3_PUBLIC_ENDPOINT;

const baseConfig: S3ClientConfig = {
  region: config.region,
  // MinIO doesn't support virtual-hosted-style bucket URLs
  forcePathStyle: !!s3Endpoint,
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
