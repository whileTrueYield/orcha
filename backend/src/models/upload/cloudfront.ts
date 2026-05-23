import { CloudFront } from "@aws-sdk/client-cloudfront";
import { config } from "../../config";

export const cloudfront = new CloudFront({ region: config.region });
