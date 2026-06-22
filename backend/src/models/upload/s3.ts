// S3 client setup for file uploads and documentation publishing.
//
// Exports two clients:
//   s3       — for server-side operations (putObject, deleteObject), talks to
//              the internal endpoint the backend container can reach.
//   s3Client — for generating browser-facing presigned upload URLs, talks to
//              the public *origin* endpoint the browser can POST to.
//
// Three distinct hosts are involved here; conflating them silently produces
// unreachable presigned upload URLs, so keep them separate:
//
//   S3_ENDPOINT         Internal origin (backend → storage). Local dev: the
//                       Docker-network MinIO host (`minio:9000`). Real
//                       S3/Spaces: the regional origin, which is also
//                       browser-reachable.
//   S3_PUBLIC_ENDPOINT  Browser-facing *origin* for presigned upload POSTs.
//                       Only needed where it differs from S3_ENDPOINT — local
//                       dev (browser needs `localhost`, backend needs `minio`)
//                       and self-hosted (the Traefik `/uploads` route). Falls
//                       back to S3_ENDPOINT, which is already correct for real
//                       S3/Spaces.
//   UPLOADS_CDN_URL     Read-only CDN URL for *serving* uploaded files.
//                       Deliberately NOT used here: the CDN edge rejects
//                       upload POSTs (no write path, no upload CORS). Pointing
//                       the presigned client at the CDN is what produced the
//                       "<cdn-host>/<bucket-as-encoded-path>" upload failures.
//
// Credentials come from the S3_ACCESS_KEY / S3_SECRET_KEY env vars.

import { S3Client, S3, S3ClientConfig } from "@aws-sdk/client-s3";
import { config } from "../../config";

const s3Endpoint = process.env.S3_ENDPOINT;
const s3PublicEndpoint = process.env.S3_PUBLIC_ENDPOINT;

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

// Presigned upload URLs must target the public *origin* the browser can POST
// to — never the CDN. Prefer an explicit public override (S3_PUBLIC_ENDPOINT),
// otherwise reuse the origin endpoint (already browser-reachable on real
// S3/Spaces), otherwise the SDK default (real AWS).
export const s3Client = new S3Client({
  ...baseConfig,
  endpoint: s3PublicEndpoint || s3Endpoint || undefined,
});
