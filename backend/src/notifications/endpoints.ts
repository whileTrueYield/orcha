import { Request, Response } from "express";
import webpush from "web-push";
import { logger } from "../logger";
import prisma from "../prisma";

const isTest = process.env.NODE_ENV === "test";

const hostname = isTest ? "localhost" : process.env.ORCHA_HOSTNAME;
const vapidPrivateKey = isTest
  ? "qWplLAn5pGR-wezKW48OzGW4i8xIr-r0PypOShWBuVc"
  : process.env.VAPID_PRIVATE_KEY;
const vapidPublicKey = isTest
  ? "BJbpmG1IMHkEG7jr-u-sJfuJF9pqjZ2SDpC4A19UovAwXGu8ApWmZgmLkdxY7ppEmXpzzwcSO1PiFtZMSO2S9Fg"
  : process.env.VAPID_PUBLIC_KEY;

// Reads env directly (not ./config) so this module can be imported
// without the full config bootstrap and its env-var guards.
if (!hostname) {
  throw Error("ORCHA_HOSTNAME env variable is undefined");
}

if (!vapidPrivateKey) {
  throw Error("VAPID_PRIVATE_KEY env variable is undefined");
}

if (!vapidPublicKey) {
  throw Error("VAPID_PUBLIC_KEY env variable is undefined");
}

// configure notification VAPID keys
webpush.setVapidDetails(
  `mailto:no-reply@${hostname}`,
  vapidPublicKey,
  vapidPrivateKey,
);

/**
 * Send a notification to a subscription
 *
 * Note that the function is exported for testing purposes
 * @param subscription
 * @param payload
 * @returns
 */
export function sendNotification(
  subscription: webpush.PushSubscription,
  payload: string,
) {
  // do not send notification in test mode
  if (isTest) {
    return Promise.resolve();
  }

  return webpush.sendNotification(subscription, payload);
}

interface SubscriptionBody {
  endpoint: string;
  expirationTime: string | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function unsubscribe(req: Request, res: Response) {
  const { endpoint }: { endpoint: string } = req.body;

  try {
    await prisma.pushSubscription.delete({
      where: { endpoint },
    });
    res.status(200).json({ status: "subscription deleted" });
    res.send();
  } catch {
    res.status(404).json({ status: "subscription not found" });
    res.send();
  }
}

/**
 * Web push subscribe endpoint
 */
export async function subscribe(req: Request, res: Response) {
  const roleId = req.session?.roleId;

  if (!roleId) {
    res.status(401);
    res.send({ status: "Unauthorized" });
    res.end();
    return;
  }

  // Get pushSubscription object
  const subscription: SubscriptionBody = req.body;

  // Create payload
  const payload = JSON.stringify({ category: "PUSH_TEST" });

  // Pass object into sendNotification
  try {
    // check if this endpoint already exist
    const pushSubscription = await prisma.pushSubscription.findFirst({
      where: { endpoint: subscription.endpoint },
    });

    if (!pushSubscription) {
      await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime,
          JSONkeys: JSON.stringify(subscription.keys),
          roleId,
        },
      });

      await sendNotification(subscription as webpush.PushSubscription, payload);

      res.status(201).json({ status: "subscribed" });
      res.send();
    } else if (pushSubscription.roleId !== roleId) {
      await prisma.pushSubscription.update({
        where: { id: pushSubscription.id },
        data: { roleId },
      });
      res.status(200).json({ status: "subscription updated" });
      res.send();
    } else {
      res.status(200).json({ status: "already subscribed" });
      res.send();
    }
  } catch (error) {
    logger.error(error);
  }
}

interface SubscriptionUpdateBody {
  old_endpoint: string;
  endpoint: string;
  expirationTime: string | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Web push subscribe endpoint updated endpoint
 */
export async function update_subscription(req: Request, res: Response) {
  // Get pushSubscription object
  const subscription: SubscriptionUpdateBody = req.body;

  // check if this endpoint already exist
  const pushSubscription = await prisma.pushSubscription.findFirst({
    where: { endpoint: subscription.old_endpoint },
  });

  if (pushSubscription) {
    await prisma.pushSubscription.updateMany({
      where: {
        id: pushSubscription.id,
      },
      data: {
        endpoint: subscription.endpoint,
        JSONkeys: JSON.stringify(subscription.keys),
      },
    });

    res.status(201).json({ status: "subscription updated" });
    res.send();
  } else {
    res.status(404).json({ status: "subscription not found" });
  }
}

// When adding a new category, make sure the
// notification worker is updated to handle it too
type NotificationCategory =
  | "MENTION"
  | "REPLY"
  | "OWNED"
  | "WATCHED"
  | "ACCEPTED_REPLY"
  | "WORK_START"
  | "WORK_STOP"
  | "PUSH_TEST"
  | "ESTIMATE_REQUESTED"
  | "CLOSED_TICKET"
  | "READY_TO_SCHEDULE";

interface NotificationPayload {
  [attr: string]: any;
  title?: string;
  notificationId?: number;
  organizationId?: string;
}

export async function pushNotifyRole(
  roleId: number,
  organizationId: number,
  category: NotificationCategory,
  title: string,
  payload: NotificationPayload = {},
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      roleId,
    },
  });

  if (subscriptions.length === 0) {
    logger.warn(`Could not notify role ${roleId}, it has no subscriptions`);
  }

  for (const subscription of subscriptions) {
    try {
      await sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: JSON.parse(subscription.JSONkeys),
        },
        JSON.stringify({ ...payload, organizationId, category, title }),
      );

      logger.info(`Notifying role ${roleId}: ${category}`);
    } catch (error) {
      if (error.statusCode === 401 || error.statusCode === 410) {
        console.error(error);
        console.warn(
          "Subscription endpoint no longer valid, deleting",
          error.endpoint,
        );

        await prisma.pushSubscription.delete({
          where: {
            endpoint: error.endpoint,
          },
        });
      }
    }
  }
}
