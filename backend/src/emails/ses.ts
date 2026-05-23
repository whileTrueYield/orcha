import { SESClient } from "@aws-sdk/client-ses";
import { config } from "../config";

export const ses = new SESClient({ region: config.region });
