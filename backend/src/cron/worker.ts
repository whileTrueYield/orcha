require("reflect-metadata");

import { Worker, Job } from "bullmq";
import { logger } from "../logger";
import {
  publishDocumentationTask,
  unpublishDocumentationTask,
} from "../models/documentation/jobs/publishDocumentationTask";
import { startReminder } from "../models/role/jobs/startReminder";
import { workDayEmail } from "../models/role/jobs/workDayEmail";
import { autoClockOut } from "../models/schedule/jobs/autoClockOut";
import { autoResolveIssues } from "./jobs/autoResolveIssues";
import { nightlyEstimateTickets } from "./jobs/nightlyEstimateTickets";
import { onDemandEstimateTickets } from "./jobs/onDemandEstimateTickets";
import { buildDemo } from "./jobs/buildDemo";
import { autoResumeTask } from "../models/role/jobs/autoResumeTask";

async function processorFn(job: Job) {
  switch (job.name) {
    case "autoClockOut":
      // when we reach the end of the work day, stop any active task
      logger.info("starting autoClockOut");
      return autoClockOut();

    case "workDayEmail":
      // sends an email every morning to every active members of an organization
      logger.info("starting workDayEmail");
      return workDayEmail();

    case "buildDemo":
      // sends an email every morning to every active members of an organization
      logger.info("starting buildDemo");
      return buildDemo();

    case "startReminder":
      // sends a notification to every user when it's time to get back to work
      logger.info("starting startReminder");
      return startReminder();

    case "autoResumeTask":
      // sends a notification to every user when it's time to get back to work
      logger.info("starting autoResumeTask");
      return autoResumeTask();

    case "nightlyEstimateTickets":
      // ensure that at most every organization have their estimates re-computed
      // every 4 hours
      logger.info("starting nightlyEstimateTickets");
      return nightlyEstimateTickets();

    case "onDemandEstimateTickets":
      // when a change requiring a re-estimates of the delivery date happens
      logger.info("starting onDemandEstimateTickets");
      return onDemandEstimateTickets(job.data.organizationId, job.timestamp);

    case "publishDocumentation":
      // Generate a documentation into HTML and JS and push it to S3
      logger.info("starting publishDocumentation");
      return publishDocumentationTask(job.data.documentationId);

    case "unpublishDocumentation":
      // Delete documentation HTML and JS files from S3 and flush the CDN
      logger.info("starting publishDocumentation");
      return unpublishDocumentationTask(job.data.documentationId);

    case "autoResolveIssues":
      // auto resolve inactive issues
      logger.info("starting autoResolveIssues");
      return autoResolveIssues();

    default:
      logger.warning("unknown job", job.name);
  }
}

export const worker = new Worker("cron", processorFn, {
  connection: {
    host: process.env.REDIS_HOSTNAME || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  autorun: false,
  concurrency: 5,
});

worker.on("completed", async (job: Job) =>
  logger.info(`Job ${job.name} completed`),
);

worker.on("error", async (error: Error) =>
  logger.error(`Worker error,${error.name}: ${error.message}`),
);
