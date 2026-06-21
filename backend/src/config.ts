import { randomUUID } from "crypto";
import { resolve } from "path";
import { logger } from "./logger";

console.log(`NODE_ENV is ${process.env.NODE_ENV}`);

interface Config {
  instanceId: string;
  port: number;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  isDemo: boolean;
  isStaging: boolean;
  hostname: string;
  allowOrigin: string[];
  sessionSecret: string;
  // Base64-encoded 32-byte key for encryption at rest (see utils/crypto.ts).
  encryptionKey: string;
  assetRoot: string;
  webAppUri: string;
  supportUri: string;
  apiUri: string;
  aiUri: string;
  uploadS3Bucket: string;
  documentationS3Bucket: string;
  documentationDistributionId: string | undefined;
  uploadCdnUri: string;
  wwwUri: string;
  region: string;
  uploadPrefix: string;
  // Path prefix for API routes. Empty string for self-hosted (Traefik strips
  // the prefix), "/api" for DO App Platform (preserves the prefix).
  apiPathPrefix: string;
  email: {
    noReplyAddress: string;
    unsubscribeUri: string;
    confirmLinkExpiration: number;
    smtp: { host: string; port: number; user: string; pass: string } | null;
    resendApiKey: string | null;
  };
  upload: {
    multiples: boolean;
    uploadDir: string;
    keepExtensions: boolean;
  };
  password_lost_token_expiration: number;
  pow_difficulty: number;

  // number of days without a customer reply after which the issue is
  // automatically marked as resolved
  autoResolveIssueAfter: number;

  // work reminder delay in minutes
  workReminderOffset: number;

  // add unprotected rest test interfaces for e2e tests
  testInterfaces: boolean;
}

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDemo = process.env.DEMO_MODE === "true";
const isStaging = process.env.ENV_NAME === "staging";

const testEnv = {
  ORCHA_BACKEND_PORT: "4000",
  ORCHA_HOSTNAME: "example.com",
  // Use localhost so the SDK's mcpAuthRouter localhost-exemption accepts the
  // HTTP issuer URL in tests without requiring HTTPS. api.example.com would
  // trigger "Issuer URL must be HTTPS" because the SDK only exempts localhost
  // and 127.0.0.1 for HTTP schemes.
  ORCHA_WEBAPP_URI: "http://localhost:3000",
  ORCHA_SUPPORT_URI: "http://support.example.com:3000",
  ORCHA_SESSION_SECRET: "what-evs",
  ORCHA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
  ORCHA_DOMAIN: "example.com",
  ORCHA_API_URI: "http://localhost:4000",
  ORCHA_AI_URI: "http://api.example.com:8000",
  ORCHA_WWW_URI: "http://www.example.com:3030",
  UPLOADS_BUCKET: "upload.example.com",
  DOCS_BUCKET: "documentation.example.com",
  UPLOADS_CDN_URL: "https://upload.example.com",
  DOCS_CDN_URL: "https://documentation.example.com",
  S3_REGION: "us-west-1",
  DOCUMENTATION_DISTRIBUTION_ID: "MY_AWS_DISTRIBUTION_ID",
  DATABASE_URL: process.env.DATABASE_URL,
};

// default to test environment variable if in test mode
const env = isTest
  ? testEnv
  : {
      ORCHA_BACKEND_PORT: process.env.ORCHA_BACKEND_PORT || "4000",
      ORCHA_HOSTNAME: process.env.ORCHA_HOSTNAME,
      ORCHA_WEBAPP_URI: process.env.ORCHA_WEBAPP_URI,
      ORCHA_SUPPORT_URI: process.env.ORCHA_SUPPORT_URI,
      ORCHA_SESSION_SECRET: process.env.ORCHA_SESSION_SECRET,
      ORCHA_ENCRYPTION_KEY: process.env.ORCHA_ENCRYPTION_KEY,
      ORCHA_DOMAIN: process.env.ORCHA_DOMAIN,
      ORCHA_API_URI: process.env.ORCHA_API_URI,
      ORCHA_AI_URI: process.env.ORCHA_AI_URI,
      ORCHA_WWW_URI: process.env.ORCHA_WWW_URI,
      UPLOADS_BUCKET: process.env.UPLOADS_BUCKET,
      DOCS_BUCKET: process.env.DOCS_BUCKET,
      UPLOADS_CDN_URL: process.env.UPLOADS_CDN_URL,
      DOCS_CDN_URL: process.env.DOCS_CDN_URL,
      S3_REGION: process.env.S3_REGION,
      DOCUMENTATION_DISTRIBUTION_ID: process.env.DOCUMENTATION_DISTRIBUTION_ID,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    };

if (!env.ORCHA_HOSTNAME) {
  throw Error("ORCHA_HOSTNAME env variable is undefined");
}

if (!env.ORCHA_SUPPORT_URI) {
  throw Error("ORCHA_SUPPORT_URI env variable is undefined");
}

if (!env.ORCHA_WEBAPP_URI) {
  throw Error("ORCHA_WEBAPP_URI env variable is undefined");
}

if (!env.ORCHA_SESSION_SECRET) {
  throw Error("ORCHA_SESSION_SECRET env variable is undefined");
}

if (!env.ORCHA_ENCRYPTION_KEY) {
  throw Error("ORCHA_ENCRYPTION_KEY env variable is undefined");
}

if (!env.ORCHA_DOMAIN) {
  throw Error("ORCHA_DOMAIN env variable is undefined");
}

if (!env.ORCHA_API_URI) {
  throw Error("ORCHA_API_URI env variable is undefined");
}

if (!env.ORCHA_AI_URI) {
  throw Error("ORCHA_AI_URI env variable is undefined");
}

if (!env.ORCHA_WWW_URI) {
  throw Error("ORCHA_WWW_URI env variable is undefined");
}

if (!env.UPLOADS_BUCKET) {
  throw Error("UPLOADS_BUCKET env variable is undefined");
}

if (!env.DOCS_BUCKET) {
  throw Error("DOCS_BUCKET env variable is undefined");
}

if (!env.UPLOADS_CDN_URL) {
  throw Error("UPLOADS_CDN_URL env variable is undefined");
}

if (!env.S3_REGION) {
  throw Error("S3_REGION env variable is undefined");
}

export const config: Config = {
  instanceId: randomUUID(),
  port: parseInt(env.ORCHA_BACKEND_PORT),
  isDev,
  isProd,
  isTest,
  isDemo,
  isStaging,
  // in the frontend repo, use: git rev-parse --short HEAD
  sessionSecret: env.ORCHA_SESSION_SECRET,
  encryptionKey: env.ORCHA_ENCRYPTION_KEY,
  hostname: env.ORCHA_HOSTNAME,
  // ORCHA_API_URI is the server's own public origin: the OAuth consent flow is a
  // server-rendered, same-origin browser flow (the consent page on api.* POSTs back
  // to api.*), so the browser sends Origin: <api uri>. A same-origin request must
  // pass CORS, hence the API's own origin belongs in the allowlist.
  allowOrigin: [
    env.ORCHA_WEBAPP_URI,
    env.ORCHA_SUPPORT_URI,
    env.ORCHA_WWW_URI,
    env.ORCHA_API_URI,
  ],
  webAppUri: env.ORCHA_WEBAPP_URI,
  supportUri: env.ORCHA_SUPPORT_URI,
  wwwUri: env.ORCHA_WWW_URI,
  aiUri: env.ORCHA_AI_URI,
  apiUri: env.ORCHA_API_URI,
  uploadS3Bucket: env.UPLOADS_BUCKET,
  documentationS3Bucket: env.DOCS_BUCKET,
  documentationDistributionId: env.DOCUMENTATION_DISTRIBUTION_ID || undefined,
  uploadCdnUri: env.UPLOADS_CDN_URL,
  region: env.S3_REGION,
  apiPathPrefix: process.env.API_PATH_PREFIX || "",
  uploadPrefix: process.env.ORCHA_UPLOAD_PREFIX || "",
  assetRoot: resolve(__dirname, "../assets/"),
  email: {
    unsubscribeUri: `${process.env.ORCHA_API_URI}/unsubscribe`,
    confirmLinkExpiration: 3600, // 1 hour
    noReplyAddress: `no-reply@${process.env.ORCHA_DOMAIN}`,
    smtp: process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        }
      : null,
    resendApiKey: process.env.RESEND_API_KEY || null,
  },
  upload: {
    multiples: true,
    uploadDir: `${__dirname}/../upload`,
    keepExtensions: true,
  },
  password_lost_token_expiration: 600, // 10 minutes
  pow_difficulty: 4, // proof of work difficulty level, in power of 10
  autoResolveIssueAfter: 28, // auto resolve issue after 28 days
  workReminderOffset: 10, // work reminder offset in minutes

  // test REST interfaces do not run in PROD and only if ORCHA_TEST_INTERFACE is set to true
  testInterfaces: isProd ? false : process.env.ORCHA_TEST_INTERFACE === "true",
};

logger.info(`Config is ready, \n${JSON.stringify(config, null, 2)}`);
