import { fileTypeFromBuffer } from "file-type";
import multer from "multer";
import { BadRequestException } from "../../exception/domain.exception";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { string } from "zod";
import { Request } from "express";
import { StorageApproachEnum } from "../../enum/multer.enum";
import { tmpdir } from "node:os";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};
export const localFileUpload = ({
  maxFileSize = 5,
  storageApproach = StorageApproachEnum.MEMORY,
}: {
  maxFileSize?: number;
  storageApproach?: StorageApproachEnum;
}) => {
  const storage =
    storageApproach == StorageApproachEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, tmpdir());
          },
          filename: function (req, file, cb) {
            cb(null, randomUUID() + file.originalname);
          },
        });
  // function fileFilter(req, file, cb) {
  //   console.log(file.mimetype);
  //   if (validation.includes(file.mimetype)) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("invalid format", { cause: { status: 400 } }), false);
  //   }
  // }
  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};

export const processFile = async ({
  customPath = "general",
  file,
  validation,
}: {
  customPath?: string;
  file: Express.Multer.File;
  validation: string[];
}) => {
  if (file.path) {
    file.buffer = await readFile(file.path);
  }
  const result = await fileTypeFromBuffer(file.buffer);
  if (!result || !validation.includes(result.mime)) {
    await unlink(file.path);
    throw new BadRequestException("invalid file format");
  } else {
    await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
    const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;

    await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
    if (file.path) {
      await unlink(file.path);
    }
    file.path = uniqueFilePath;
    return file;
  }
};

export const processFiles = async ({
  customPath = "general",
  files,
  validation,
}: {
  customPath: string;
  files: Express.Multer.File[];
  validation: string[];
}) => {
  const assets = [];
  for (const file of files) {
    const uploadfile = await processFile({ customPath, file, validation });
    assets.push(uploadfile);
  }
  return assets;
};

export const processFields = async ({
  customPath = "general",
  fields,
  validation,
}: {
  customPath: string;
  fields: Record<string, Express.Multer.File[]>;
  validation: string[];
}) => {
  const assets = [];
  for (const field of Object.keys(fields)) {
    const files = await processFiles({
      customPath,
      files: fields[field] as Express.Multer.File[],
      validation,
    });
    assets.push({ field, files });
  }
  return assets;
};

export const processMulterUpload = async ({
  customPath = "general",
  validation = [],
  req,
  isRequired = true,
}: {
  customPath?: string;
  validation: string[];
  req: Request;
  isRequired?: boolean;
}) => {
  if (
    isRequired &&
    !req.file &&
    !(Array.isArray(req.files) && req.files?.length) &&
    !(typeof req.files == "object" && Object.keys(req.files))
  ) {
    throw new BadRequestException("File is Requires");
  }
  if (req.file) {
    await processFile({ customPath, file: req.file, validation });
  } else if (Array.isArray(req.files)) {
    await processFiles({ customPath, files: req.files, validation });
  } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
    await processFields({ customPath, fields: req.files, validation });
  }
};

/*

export const processFile = ({ validation = [] }) => {
  return async (req, res, next) => {
    const filePath = resolve(`./${file.path}`);
    const fileBuffer = await readFile(filePath);
    const result = await fileTypeFromBuffer(fileBuffer);

    if (!result || !validation.includes(result.mime)) {
      await unlink(filePath);
      next(new Error("invalid file format", { cause: { status: 400 } }));
    }
    next();
  };
};

*/
