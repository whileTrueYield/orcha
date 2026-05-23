import { Request, Response } from "express";
import { Router } from "express";
import { emailConfirmation, pow } from "./models/auth/endpoints";
import {
  fileUploadReq,
  unverifiedFileUploadReq,
} from "./models/upload/endpoints";
import {
  addImageToIssue,
  contactUs,
  reportIssue,
} from "./models/issue/endpoints";
import { config } from "./config";
import { createTestUser, loginForTest } from "./models/auth/testEndpoints";
import { logger } from "./logger";
import fetch from "node-fetch";
import { testEmail } from "./models/role/endpoints";
import {
  subscribe,
  unsubscribe,
  update_subscription,
} from "./notifications/endpoints";
import { redis } from "./redis";
import prisma from "./prisma";

export const router = Router();

// email confirmation endpoint
router.get("/email_confirm", emailConfirmation);

// upload endpoints
router.post("/file_upload_req", fileUploadReq);
router.post("/file_upload_req_unverified", unverifiedFileUploadReq);

// support endpoint
router.post("/support", reportIssue);
router.post("/support/add_image", addImageToIssue);

router.post("/contact_us", contactUs);

// proof of work endpoint
router.get("/pow", pow);

// web-push subscribe
router.post("/subscribe", subscribe);
router.post("/update_subscription", update_subscription);
router.post("/unsubscribe", unsubscribe);

// proof of work endpoint
router.get("/alive", async (_: Request, res: Response) => {
  // check communication with the AI server
  let ai_status = "FAILED";
  try {
    const response = await fetch(config.aiUri + "/alive", { timeout: 1000 });
    ai_status = response.statusText;
  } catch (error) {
    logger.error(error);
  }

  // check the prisma/DB access
  let db_status = "FAILED";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db_status = "OK";
  } catch (error) {
    logger.error(error);
  }

  res.status(200);
  res.send({
    status: "success",
    data: { ai_status, cache_status: redis.status, db_status },
  });
  res.end();
});

if (config.isDev) {
  router.get("/__tests/email", testEmail);
}

if (config.testInterfaces) {
  logger.warn(
    "DANGER: Tests interfaces are active, this should not be the case in PRODUCTION!"
  );
  // e2e test support endpoint
  router.post("/__tests/create_user", createTestUser);
  router.post("/__tests/login", loginForTest);
  router.post("/__tests/last_email", loginForTest);
  router.post("/__tests/login", loginForTest);
}
