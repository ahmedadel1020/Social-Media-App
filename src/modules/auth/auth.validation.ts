import { email, z } from "zod";

import { LanguageEnum } from "../../common/enum/security.enum";
import { generalValidationFields } from "../../common/utils/validation";

export const loginSchema = (lang: LanguageEnum) => {
  return z.strictObject({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password(lang),
  });
};

export const login = (lang: LanguageEnum) => {
  return z.object({
    body: loginSchema(lang),
  });
};
export const signup = (lang: LanguageEnum) => {
  return z.object({
    body: loginSchema(lang)
      .safeExtend({
        username: generalValidationFields.username(lang),
        confirmPassword: generalValidationFields.confirmPassword(lang),
        phone: generalValidationFields.phone(lang),
        gender: generalValidationFields.gender(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFields.matchFields({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};

export const confirmEmail = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp(lang),
    }),
  });
};

export const resendConfirmEmail = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
    }),
  });
};
