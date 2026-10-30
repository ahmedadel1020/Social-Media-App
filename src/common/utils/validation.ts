import { z } from "zod";
import mongoose from "mongoose";
import { LanguageEnum } from "../enum/security.enum";
import { GenderEnum } from "../enum/user.enum";
const matchFields = ({
  original,
  copy,
  data,
  ctx,
  lang,
}: {
  original: string;
  copy: string;
  data: any;
  ctx: z.RefinementCtx;
  lang?: LanguageEnum;
}) => {
  if (data[original] != data[copy]) {
    ctx.addIssue({
      message:
        lang == LanguageEnum.AR
          ? `فشل التطابق بين ${original} و ${copy}`
          : `${original} is mismatched with ${copy}`,
      code: "custom",
      path: [copy],
    });
  }
};
export const generalValidationFields = {
  email: (lang: LanguageEnum) => z.email({ message: "invalid email format" }),
  password: (lang: LanguageEnum) =>
    z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/)
      .min(8)
      .max(16),
  username: (lang: LanguageEnum) =>
    z
      .string()
      .min(2, {
        message:
          lang == LanguageEnum.AR
            ? "عفوا لا يمكن ادخال اسم المستخدم اقل من حرفين"
            : "minimum charachters is 2",
      })
      .max(51),
  confirmPassword: (lang: LanguageEnum) => z.string().min(8).max(16),
  phone: (lang: LanguageEnum) => z.e164(),
  gender: (lang: LanguageEnum) => z.enum(GenderEnum),
  otp: (lang: LanguageEnum) =>
    z.string().regex(/^\d{6}$/, { error: "invalid code" }),
  matchFields,
  id: (lang: LanguageEnum) =>
    z.string().refine(
      (data) => {
        return mongoose.Types.ObjectId.isValid(data);
      },
      { message: "invalid id format" },
    ),

  file: (lang: LanguageEnum) =>
    z.strictObject({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      buffer: z.instanceof(Buffer),
      size: z.number(),
      path: z.string(),
    }),
};
