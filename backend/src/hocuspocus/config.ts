import { randomUUID } from "crypto";

console.log(`NODE_ENV is ${process.env.NODE_ENV}`);

interface Config {
  instanceId: string;
  apiWsPort: number;
  sessionSecret: string;
}

if (!process.env.ORCHA_WS_BACKEND_PORT) {
  throw Error("ORCHA_WS_BACKEND_PORT env variable is undefined");
}

if (!process.env.ORCHA_SESSION_SECRET) {
  throw Error("ORCHA_SESSION_SECRET env variable is undefined");
}

export const config: Config = {
  instanceId: randomUUID(),
  apiWsPort: parseInt(process.env.ORCHA_WS_BACKEND_PORT),
  sessionSecret: process.env.ORCHA_SESSION_SECRET,
};
