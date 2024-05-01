import { S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { fromEnv } from "@aws-sdk/credential-providers";

export const bucketName = "instalite";

export const credentials = fromEnv();

export const storage = new S3Client({
  region: "us-east-1",
  credentials,
});
