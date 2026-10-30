import { NextFunction, Request, Response } from "express";
import { LanguageEnum } from "../common/enum/security.enum";
import { BadRequestException } from "../common/exception/domain.exception";
import { ZodType } from "zod";
type ValidationSchemaType = (lang: LanguageEnum) => ZodType;
export const validation = (schema: ValidationSchemaType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const lang = Number(req.headers["accept-language"] ?? LanguageEnum.EN);
    const validationres = schema(lang).safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!validationres.success)
      throw new BadRequestException(
        `validatin error :: ${validationres.error}`,
        validationres.error.issues,
      );
    req.validate = validationres.data;
    next();
  };
};
