// since this is a service worker, we'll need to disable the
// the rule against `self`
/* eslint no-restricted-globals: 1 */

/**
 * !!WARNING!! WEB WORKER DO NOT AUTO REFRESH
 * when making a change to this file, make sure you edit the loader of this
 * web worker, currently located at:
 * src/components/notification/PushNotification.tsx
 */
const config = {
  ApiUri: "",
  AppUri: "",
};

self.addEventListener("message", async (event) => {
  if (event.data.type) {
    switch (event.data.type) {
      case "setApiUrl":
        config.ApiUri = event.data.payload.ApiUri;
        break;
      case "setAppUrl":
        config.AppUri = event.data.payload.AppUri;
        break;
      default:
        console.warn("ignored event", event.data);
        return;
      // nothing to do here
    }
  }
});

self.addEventListener("push", (e) => {
  const data = e.data.json();

  switch (data.category) {
    case "PUSH_TEST":
      self.registration.showNotification("Orcha", {
        body: "This is a notification example",
        tag: data.category || "default",
        icon: `${config.AppUri}/img/logos/logo-transparent.png`,
        data: { category: data.category },
      });

      break;

    case "CLOSED_TICKET":
    case "MENTION":
    case "REPLY":
    case "OWNED":
    case "WATCHED":
    case "ACCEPTED_REPLY":
      self.registration.showNotification("Orcha", {
        body: data.title.replace("{}", "Someone"),
        tag: data.category || "default",
        icon: `${config.AppUri}/img/logos/logo-transparent.png`,
        data: {
          organizationId: data.organizationId,
          category: data.category,
          targetId: data.targetId,
        },
      });
      break;

    case "WORK_START":
      self.registration.showNotification("Orcha", {
        body: data.title,
        tag: "start_reminder",
        icon: `${config.AppUri}/img/logos/logo-transparent.png`,
        data: {
          organizationId: data.organizationId,
          category: data.category,
          targetId: data.targetId,
        },
      });
      break;

    case "WORK_STOP":
      self.registration.showNotification("Orcha", {
        body: data.title,
        tag: "stop_reminder",
        icon: `${config.AppUri}/img/logos/logo-transparent.png`,
        data: {
          organizationId: data.organizationId,
          category: data.category,
          targetId: data.targetId,
        },
      });
      break;

    case "ESTIMATE_REQUESTED":
      self.registration.showNotification("Orcha", {
        body: data.title,
        tag: "estimate_request",
        icon: `${config.AppUri}/img/logos/logo-transparent.png`,
        data: {
          organizationId: data.organizationId,
          category: data.category,
          targetId: data.targetId,
        },
      });
      break;

    case "READY_TO_SCHEDULE":
      self.registration.showNotification("Orcha", {
        body: data.title,
        tag: "ticket_ready",
        icon: `${config.AppUri}/img/logos/logo-transparent.png`,
        data: {
          organizationId: data.organizationId,
          category: data.category,
          targetId: data.targetId,
        },
      });
      break;

    default:
      console.warn("Unknown notification", data);
  }
});

self.addEventListener("notificationclick", (event) => {
  const organizationId = event.notification.data.organizationId;
  const targetId = event.notification.data.targetId;
  const category = event.notification.data.category;

  // Android doesn't close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // ignore PUSH_TEST category
  if (category === "PUSH_TEST") {
    return;
  }

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        includeUncontrolled: true,
      });

      let orchaClient;

      // Let's see if we already have a chat window open:
      for (const client of allClients) {
        const url = new URL(client.url);

        // We'll find the one window matching our current organizationId
        if (url.pathname.startsWith(`/org/${organizationId}/`)) {
          client.focus();
          // message the client to display the notification
          client.postMessage({ category, targetId });

          // we do not display a reminder here, and let the tab receiving
          // the reminder handle it
          return;
        }
      }

      // If we didn't find an existing chat window, open a new one:
      if (!orchaClient) {
        self.clients.openWindow(
          `/org/${organizationId}/dashboard?notification_category=${category}&target_id=${targetId}`
        );
      }
    })()
  );
});

self.addEventListener("pushsubscriptionchange", function (event) {
  event.waitUntil(
    fetch(`${config.ApiUri}/update_subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_endpoint: event.oldSubscription
          ? event.oldSubscription.endpoint
          : null,
        endpoint: event.newSubscription ? event.newSubscription.endpoint : null,
        keys: {
          p256dh: event.newSubscription
            ? event.newSubscription.toJSON().keys.p256dh
            : null,
          auth: event.newSubscription
            ? event.newSubscription.toJSON().keys.auth
            : null,
        },
      }),
    })
  );
});
