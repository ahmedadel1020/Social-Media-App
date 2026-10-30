"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const security_enum_1 = require("../enum/security.enum");
const user_enum_1 = require("../enum/user.enum");
const matchFields = ({ original, copy, data, ctx, lang, }) => {
    if (data[original] != data[copy]) {
        ctx.addIssue({
            message: lang == security_enum_1.LanguageEnum.AR
                ? `فشل التطابق بين ${original} و ${copy}`
                : `${original} is mismatched with ${copy}`,
            code: "custom",
            path: [copy],
        });
    }
};
exports.generalValidationFields = {
    email: (lang) => zod_1.z.email({ message: "invalid email format" }),
    password: (lang) => zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/)
        .min(8)
        .max(16),
    username: (lang) => zod_1.z
        .string()
        .min(2, {
        message: lang == security_enum_1.LanguageEnum.AR
            ? "عفوا لا يمكن ادخال اسم المستخدم اقل من حرفين"
            : "minimum charachters is 2",
    })
        .max(51),
    confirmPassword: (lang) => zod_1.z.string().min(8).max(16),
    phone: (lang) => zod_1.z.e164(),
    gender: (lang) => zod_1.z.enum(user_enum_1.GenderEnum),
    otp: (lang) => zod_1.z.string().regex(/^\d{6}$/, { error: "invalid code" }),
    matchFields,
    id: (lang) => zod_1.z.string().refine((data) => {
        return mongoose_1.default.Types.ObjectId.isValid(data);
    }, { message: "invalid id format" }),
    file: (lang) => zod_1.z.strictObject({
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        buffer: zod_1.z.instanceof(Buffer),
        size: zod_1.z.number(),
        path: zod_1.z.string(),
    }),
};
