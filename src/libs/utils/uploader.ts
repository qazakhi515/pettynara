import path from "path";
import multer from "multer";
import { v4 } from "uuid";
import { RequestHandler } from "express";
import { getS3Config, putImageToS3 } from "./s3";
import Errors, { HttpCode, Message } from "../Errors";

/**
 * Image uploads go to S3 when AWS_REGION and AWS_S3_BUCKET are set, and to the
 * local ./uploads folder otherwise (so local development works without AWS).
 *
 * Either way the uploaded file's `path` ends up holding what gets stored in
 * MongoDB — an S3 URL or "uploads/<address>/<name>" — so controllers keep
 * reading `req.file.path` / `req.files[i].path` unchanged.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per image

const limits = { fileSize: MAX_FILE_SIZE };

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files can be uploaded"));
};

const makeFileName = (originalName: string) =>
  v4() + path.extname(originalName).toLowerCase();

const uploadToS3 = async (file: Express.Multer.File, address: string) => {
  const key = `${address}/${makeFileName(file.originalname)}`;
  file.path = await putImageToS3(key, file.buffer, file.mimetype);
};

const pushToS3 =
  (address: string): RequestHandler =>
  async (req, res, next) => {
    try {
      const files = req.file
        ? [req.file]
        : Array.isArray(req.files)
          ? req.files
          : [];
      await Promise.all(files.map((file) => uploadToS3(file, address)));
      next();
    } catch (err) {
      console.log("Error, uploadToS3:", err);
      next(err);
    }
  };

/** A rejected file is the client's mistake: answer 400 instead of a 500. */
const rejectBadUpload =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    handler(req, res, (err?: unknown) => {
      if (!err) return next();
      console.log("Error, upload:", err);
      const error = new Errors(HttpCode.BAD_REQUEST, Message.INVALID_IMAGE);
      res.status(error.code).json(error);
    });

const getDiskStorage = (address: string) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${address}`);
    },
    filename: function (req, file, cb) {
      cb(null, makeFileName(file.originalname));
    },
  });

const makeUploader = (address: string) => {
  const useS3 = Boolean(getS3Config());
  const upload = multer({
    storage: useS3 ? multer.memoryStorage() : getDiskStorage(address),
    limits,
    fileFilter,
  });
  const afterUpload: RequestHandler[] = useS3 ? [pushToS3(address)] : [];

  return {
    single: (fieldName: string): RequestHandler[] => [
      rejectBadUpload(upload.single(fieldName)),
      ...afterUpload,
    ],
    array: (fieldName: string, maxCount?: number): RequestHandler[] => [
      rejectBadUpload(upload.array(fieldName, maxCount)),
      ...afterUpload,
    ],
  };
};

export default makeUploader;
