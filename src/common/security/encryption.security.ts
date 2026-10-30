import crypto from "node:crypto";

import { ENC_KEY, IV_LENGTH } from "../../config";

export const encryption = async (plaintext: string): Promise<string> => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);
  let encryptdata = cipher.update(plaintext, "utf-8", "hex");
  encryptdata += cipher.final("hex");
  return `${iv.toString("hex")}::${encryptdata}`;
};

export const decrypt = async (ciphertext: string): Promise<string> => {
  const [iv, encryptdata] = ciphertext.split("::") as [string, string];
  const iv_vector = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, iv_vector);
  let decrypted = decipher.update(encryptdata, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};
