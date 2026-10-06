import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Shared S3 access for image uploads and the uploads migration script.
 *
 * Credentials are not read here: the AWS SDK picks up AWS_ACCESS_KEY_ID and
 * AWS_SECRET_ACCESS_KEY from the environment, or the instance role on EC2.
 */

// Read lazily: env is loaded by dotenv in server.ts, not at import time here.
export const getS3Config = () => {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  return region && bucket ? { region, bucket } : null;
};

let s3Client: S3Client | null = null;

/** Uploads an image and returns its public URL. */
export const putImageToS3 = async (
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> => {
  const config = getS3Config();
  if (!config) throw new Error("S3 is not configured");

  if (!s3Client) s3Client = new S3Client({ region: config.region });
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Names are random UUIDs and never overwritten, so browsers and CDNs
      // can cache them for good.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
};
