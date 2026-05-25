import { Queue } from "bullmq";
import { logger } from "../logger";
import { config } from "../config";
import { redisConfig } from "../redis";

export const cronQueue = new Queue("cron", {
  connection: redisConfig,
});

export async function initCron() {
  for (const repeatableJob of await cronQueue.getRepeatableJobs()) {
    await cronQueue.removeRepeatableByKey(repeatableJob.key);
    logger.info(`Flushing repeatable job ${repeatableJob.key}`);
  }

  // Repeat job once every every minutes at the 20 seconds mark
  await cronQueue.add("autoClockOut", null, {
    repeat: {
      pattern: "20 */1 * * * *", // every minutes
    },
    jobId: "autoClockOut",
    removeOnComplete: true,
  });

  // Repeat job once every 15 second mark
  await cronQueue.add("workDayEmail", null, {
    repeat: {
      pattern: "*/15 * * * * *", // every 15 seconds
    },
    jobId: "workDayEmail",
    removeOnComplete: true,
  });

  // Repeat job once every 20 second mark
  await cronQueue.add("startReminder", null, {
    repeat: {
      pattern: "*/20 * * * * *", // every 15 seconds
    },
    jobId: "startReminder",
    removeOnComplete: true,
  });

  // Repeat job once every 20 second mark
  await cronQueue.add("autoResumeTask", null, {
    repeat: {
      pattern: "*/30 * * * * *", // every 30 seconds
    },
    jobId: "autoResumeTask",
    removeOnComplete: true,
  });

  // Repeat job once every minutes at the 40 second mark
  await cronQueue.add("nightlyEstimateTickets", null, {
    repeat: {
      pattern: "40 */1 * * * *", // every 1 minute
    },
    jobId: "nightlyEstimateTickets",
    removeOnComplete: true,
  });

  // Repeat job once every minutes at the 40 second mark
  await cronQueue.add("autoResolveIssues", null, {
    repeat: {
      pattern: "50 */10 * * * *", // every 10 minutes
    },
    jobId: "autoResolveIssues",
    removeOnComplete: true,
  });

  if (config.isDemo) {
    // Run every 30 seconds
    await cronQueue.add("buildDemo", null, {
      repeat: {
        pattern: "*/30 * * * * *", // every 30 seconds
      },
      jobId: "buildDemo",
      removeOnComplete: true,
    });
  }

  const jobs = await cronQueue.getRepeatableJobs();
  logger.info(`Created ${jobs.length} new repeatable jobs`);
}
