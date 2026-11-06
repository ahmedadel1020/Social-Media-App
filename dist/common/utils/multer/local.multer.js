"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMulterUpload = exports.processFields = exports.processFiles = exports.processFile = exports.localFileUpload = exports.fileValidation = void 0;
const file_type_1 = require("file-type");
const multer_1 = __importDefault(require("multer"));
const domain_exception_1 = require("../../exception/domain.exception");
const promises_1 = require("node:fs/promises");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const multer_enum_1 = require("../../enum/multer.enum");
const node_os_1 = require("node:os");
exports.fileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    files: ["application/pdf", "application/json"],
};
const localFileUpload = ({ maxFileSize = 5, storageApproach = multer_enum_1.StorageApproachEnum.MEMORY, }) => {
    const storage = storageApproach == multer_enum_1.StorageApproachEnum.MEMORY
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                cb(null, (0, node_os_1.tmpdir)());
            },
            filename: function (req, file, cb) {
                cb(null, (0, node_crypto_1.randomUUID)() + file.originalname);
            },
        });
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: maxFileSize * 1024 * 1024 },
    });
};
exports.localFileUpload = localFileUpload;
const processFile = async ({ customPath = "general", file, validation, }) => {
    if (file.path) {
        file.buffer = await (0, promises_1.readFile)(file.path);
    }
    const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
    if (!result || !validation.includes(result.mime)) {
        await (0, promises_1.unlink)(file.path);
        throw new domain_exception_1.BadRequestException("invalid file format");
    }
    else {
        await (0, promises_1.mkdir)((0, node_path_1.resolve)(`./assets/${customPath}`), { recursive: true });
        const uniqueFilePath = `assets/${customPath}/${(0, node_crypto_1.randomUUID)()}.${result.ext}`;
        await (0, promises_1.writeFile)((0, node_path_1.resolve)(`./${uniqueFilePath}`), file.buffer);
        if (file.path) {
            await (0, promises_1.unlink)(file.path);
        }
        file.path = uniqueFilePath;
        return file;
    }
};
exports.processFile = processFile;
const processFiles = async ({ customPath = "general", files, validation, }) => {
    const assets = [];
    for (const file of files) {
        const uploadfile = await (0, exports.processFile)({ customPath, file, validation });
        assets.push(uploadfile);
    }
    return assets;
};
exports.processFiles = processFiles;
const processFields = async ({ customPath = "general", fields, validation, }) => {
    const assets = [];
    for (const field of Object.keys(fields)) {
        const files = await (0, exports.processFiles)({
            customPath,
            files: fields[field],
            validation,
        });
        assets.push({ field, files });
    }
    return assets;
};
exports.processFields = processFields;
const processMulterUpload = async ({ customPath = "general", validation = [], req, isRequired = true, }) => {
    if (isRequired &&
        !req.file &&
        !(Array.isArray(req.files) && req.files?.length) &&
        !(typeof req.files == "object" && Object.keys(req.files))) {
        throw new domain_exception_1.BadRequestException("File is Requires");
    }
    if (req.file) {
        await (0, exports.processFile)({ customPath, file: req.file, validation });
    }
    else if (Array.isArray(req.files)) {
        await (0, exports.processFiles)({ customPath, files: req.files, validation });
    }
    else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
        await (0, exports.processFields)({ customPath, fields: req.files, validation });
    }
};
exports.processMulterUpload = processMulterUpload;
