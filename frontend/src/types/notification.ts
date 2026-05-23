export type NotificationType =
  | "Success"
  | "Warning"
  | "Error"
  | "Info"
  | "Version";
export interface Notification {
  index: number;
  title: string;
  subTitle?: string;
  href?: string;
  type: NotificationType;
  duration?: number;
}
