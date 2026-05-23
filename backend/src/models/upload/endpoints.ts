import { Request, Response } from "express";
import { config } from "../../config";
import { s3Client } from "./s3";
import {
  createPresignedPost,
  PresignedPostOptions,
} from "@aws-sdk/s3-presigned-post";
import { randomBytes } from "crypto";
import { logger } from "../../logger";
import { assertProofOfWork } from "../auth/helper";
import prisma from "../../prisma";

export async function fileUploadReq(req: Request, res: Response) {
  const domain = req.body.domain === "organization" ? "organization" : "role";

  if (domain === "role") {
    if (!req.session?.roleId) {
      res.status(400);
      res.send({ status: "failure" });
      logger.warn(
        "upload failed: domain is role but the session does not have a role ID info",
        req.session
      );
    } else {
      const roleId = req.session.roleId;
      return roleFileUpload(roleId, res);
    }
  } else if (domain === "organization") {
    if (!req.session?.organizationId) {
      res.status(400);
      res.send({ status: "failure" });
      logger.warn(
        "domain is organization but the session does not have an organization ID info"
      );
    } else {
      const organizationId = req.session.organizationId;
      return organizationFileUpload(organizationId, res);
    }
  }
}

export async function unverifiedFileUploadReq(req: Request, res: Response) {
  try {
    await assertProofOfWork(req.ip, req.body.hash, req.body.proof);
  } catch (error) {
    logger.warn(
      `unverifiedFileUploadReq(...): Bad proof of work provided, IPs: ${req.ips},  IP: ${req.ip}`
    );
    res.status(400);
    res.send({ status: "failure" });
    return;
  }

  const domain = req.body.domain;

  if (!domain) {
    res.status(400);
    res.send({ status: "failure" });
    logger.warn("domain was not provided");
  }

  if (domain === "organization") {
    if (!req.body.token) {
      res.status(400);
      res.send({ status: "failure" });
      logger.warn("domain is issue but the body does not have issue ID info");
    } else {
      const issue = await prisma.issue.findFirst({
        select: {
          organizationId: true,
        },
        where: { token: req.body.token },
      });

      if (!issue) {
        res.status(404);
        res.send({ status: "failure" });
        logger.warn("issue not found");
      } else {
        return organizationFileUpload(issue.organizationId, res);
      }
    }
  }
}

async function roleFileUpload(roleId: number, res: Response) {
  const filename = randomBytes(32).toString("hex");

  var params: PresignedPostOptions = {
    Bucket: config.uploadS3Bucket,
    Key: `${config.uploadPrefix}role/${roleId}/${filename}`,
    Conditions: [
      { bucket: config.uploadS3Bucket },
      ["starts-with", "$key", `${config.uploadPrefix}role/${roleId}/`], // must be a user upload
      ["starts-with", "$Content-Type", "image/"], // must be an image
      ["content-length-range", 0, 10 * 1024 * 1024], // not more than 10mb
    ],
    Expires: 600,
  };

  try {
    const { url, fields } = await createPresignedPost(s3Client, params);
    res.status(202);
    res.send({ status: "success", data: { url, fields } });
    res.end();
  } catch (error) {
    logger.error(
      "userFileUpload: AWS createPresignedPost request failed",
      error
    );
    res.status(500);
    res.send({
      status: "error",
      data: { message: "upload role file temporarily unavailable" },
    });
  }
}

async function organizationFileUpload(organizationId: number, res: Response) {
  const filename = randomBytes(32).toString("hex");

  // if (config.isDev || true) {
  //   res.status(202);
  //   res.send({
  //     status: "success",
  //     data: {
  //       url: "https://www.example.com",
  //       fields: { key: "le_file_name.jpg" },
  //     },
  //   });
  //   res.end();
  //   return;
  // }

  var params: PresignedPostOptions = {
    Bucket: config.uploadS3Bucket,
    Key: `${config.uploadPrefix}organization/${organizationId}/${filename}`,
    Conditions: [
      { bucket: config.uploadS3Bucket },
      [
        "starts-with",
        "$key",
        `${config.uploadPrefix}organization/${organizationId}/`,
      ], // must be a user upload
      ["starts-with", "$Content-Type", "image/"], // must be an image
      ["content-length-range", 0, 10 * 1024 * 1024], // not more than 10mb
    ],
    Expires: 600,
  };

  try {
    const { url, fields } = await createPresignedPost(s3Client, params);
    res.status(202);
    res.send({ status: "success", data: { url, fields } });
    res.end();
  } catch (error) {
    res.status(500);
    res.send({
      status: "error",
      data: { message: "upload org file temporarily unavailable" },
    });
    logger.error(
      "userFileUpload: AWS createPresignedPost request failed",
      error
    );
  }
  // res.setHeader("Content-Type", "application/json");
  // res.end(JSON.stringify({ url, fields }));
}
