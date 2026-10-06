/**
 * One-off migration: copies images still stored on local disk ("uploads/...")
 * to S3 and rewrites their paths in MongoDB to the S3 URLs.
 *
 * Run from the folder that contains ./uploads (inside the container: /app).
 *   Dry run, changes nothing:  node dist/scripts/migrateUploadsToS3.js
 *   Apply:                     node dist/scripts/migrateUploadsToS3.js --apply
 *
 * Safe to re-run: paths that are already URLs are skipped, and S3 keys keep
 * the existing UUID file names. A path whose file is missing on disk is left
 * as it is and reported.
 */
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { getS3Config, putImageToS3 } from "../libs/utils/s3";

const APPLY = process.argv.includes("--apply");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const stats = { files: 0, missing: 0, products: 0, members: 0 };

// The same file can be referenced by several documents; upload it once.
const migrated = new Map<string, string>();

const isUrl = (value: string) => /^https?:\/\//.test(value);

/** Returns the new value for a stored path, or null when its file is missing. */
const migratePath = async (stored: string): Promise<string | null> => {
  // Windows-style paths ("uploads\\members\\x.jpg") were stored by older code.
  const relative = stored.replace(/\\/g, "/").replace(/^\.?\//, "");
  const done = migrated.get(relative);
  if (done) return done;

  const localFile = path.resolve(relative);
  if (!fs.existsSync(localFile)) {
    console.log(`  missing on disk, left unchanged: ${stored}`);
    stats.missing++;
    return null;
  }

  const key = relative.replace(/^uploads\//, ""); // -> "products/<uuid>.jpg"
  const contentType =
    CONTENT_TYPES[path.extname(key).toLowerCase()] ??
    "application/octet-stream";
  const result = APPLY
    ? await putImageToS3(key, fs.readFileSync(localFile), contentType)
    : `s3://${key}`;

  migrated.set(relative, result);
  stats.files++;
  return result;
};

const migrateProducts = async () => {
  const products = mongoose.connection.collection("products");
  const docs = await products
    .find({ productImages: { $exists: true, $ne: [] } })
    .toArray();

  for (const doc of docs) {
    const images: string[] = doc.productImages;
    if (images.every(isUrl)) continue;

    const updated: string[] = [];
    for (const image of images) {
      updated.push(isUrl(image) ? image : (await migratePath(image)) ?? image);
    }
    if (updated.every((image, i) => image === images[i])) continue;

    console.log(`product ${doc._id} "${doc.productName}": ${updated.length} image(s)`);
    if (APPLY)
      await products.updateOne(
        { _id: doc._id },
        { $set: { productImages: updated } },
      );
    stats.products++;
  }
};

const migrateMembers = async () => {
  const members = mongoose.connection.collection("members");
  const docs = await members
    .find({ memberImage: { $exists: true, $nin: [null, ""] } })
    .toArray();

  for (const doc of docs) {
    const image: string = doc.memberImage;
    if (isUrl(image)) continue;

    const updated = await migratePath(image);
    if (!updated) continue;

    console.log(`member ${doc._id} "${doc.memberNick}"`);
    if (APPLY)
      await members.updateOne(
        { _id: doc._id },
        { $set: { memberImage: updated } },
      );
    stats.members++;
  }
};

const main = async () => {
  if (!getS3Config())
    throw new Error("AWS_REGION and AWS_S3_BUCKET must be set in .env");

  await mongoose.connect(process.env.MONGO_URL as string);
  console.log(
    APPLY
      ? "APPLY: uploading files and updating MongoDB\n"
      : "DRY RUN: nothing will be changed (pass --apply to migrate)\n",
  );

  await migrateProducts();
  await migrateMembers();

  const verb = APPLY ? "" : " (would be)";
  console.log(
    `\nFiles uploaded${verb}: ${stats.files}` +
      `\nProducts updated${verb}: ${stats.products}` +
      `\nMembers updated${verb}: ${stats.members}` +
      `\nPaths with missing files: ${stats.missing}`,
  );
};

main()
  .catch((err) => {
    console.log("Error, migrateUploadsToS3:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
