import { createLogger, format, transports } from "winston";

const { NODE_ENV } = process.env;
export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "orcha-backend" },
  transports: [
    // send the logs to the console when in dev
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      silent: NODE_ENV !== "development",
    }),
    //
    // - Write to all logs with level `info` and below to `orcha-backend-combined.log`.
    // - Write all logs error (and below) to `orcha-backend-error.log`.
    //
    new transports.File({
      filename: "orcha-backend-error.log",
      level: "error",
    }),
    new transports.File({ filename: "orcha-backend-combined.log" }),
  ],
});
