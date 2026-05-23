import { EmptyAction } from "../actionTypes";

export type NewVersionNotificationAction =
  EmptyAction<"NEW_VERSION_NOTIFICATION">;

export const newVersionNotification = (): NewVersionNotificationAction => ({
  type: "NEW_VERSION_NOTIFICATION",
});
