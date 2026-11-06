"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.hash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hash = async (plaintext, rounds = 12, minor = "b") => {
    const salt = (await bcrypt_1.default.genSalt(rounds, minor)).toString();
    return await bcrypt_1.default.hash(plaintext, salt);
};
exports.hash = hash;
const compare = async (plaintext, ciphertext) => {
    return bcrypt_1.default.compare(plaintext, ciphertext);
};
exports.compare = compare;
