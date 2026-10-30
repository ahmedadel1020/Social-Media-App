"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendConfirmEmail = exports.confirmEmail = exports.signup = exports.login = exports.loginSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/utils/validation");
const loginSchema = (lang) => {
    return zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email(lang),
        password: validation_1.generalValidationFields.password(lang),
    });
};
exports.loginSchema = loginSchema;
const login = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang),
    });
};
exports.login = login;
const signup = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang)
            .safeExtend({
            username: validation_1.generalValidationFields.username(lang),
            confirmPassword: validation_1.generalValidationFields.confirmPassword(lang),
            phone: validation_1.generalValidationFields.phone(lang),
            gender: validation_1.generalValidationFields.gender(lang),
        })
            .superRefine((data, ctx) => {
            validation_1.generalValidationFields.matchFields({
                original: "password",
                copy: "confirmPassword",
                data,
                ctx,
                lang,
            });
        }),
    });
};
exports.signup = signup;
const confirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_1.generalValidationFields.email(lang),
            otp: validation_1.generalValidationFields.otp(lang),
        }),
    });
};
exports.confirmEmail = confirmEmail;
const resendConfirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_1.generalValidationFields.email(lang),
        }),
    });
};
exports.resendConfirmEmail = resendConfirmEmail;
