"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encryption = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_1 = require("../../config");
const encryption = async (plaintext) => {
    const iv = node_crypto_1.default.randomBytes(config_1.IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", config_1.ENC_KEY, iv);
    let encryptdata = cipher.update(plaintext, "utf-8", "hex");
    encryptdata += cipher.final("hex");
    return `${iv.toString("hex")}::${encryptdata}`;
};
exports.encryption = encryption;
const decrypt = async (ciphertext) => {
    const [iv, encryptdata] = ciphertext.split("::");
    const iv_vector = Buffer.from(iv, "hex");
    const decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", config_1.ENC_KEY, iv_vector);
    let decrypted = decipher.update(encryptdata, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
};
exports.decrypt = decrypt;
