"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const security_enum_1 = require("../common/enum/security.enum");
const domain_exception_1 = require("../common/exception/domain.exception");
const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers["accept-language"] ?? security_enum_1.LanguageEnum.EN);
        const validationres = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (!validationres.success)
            throw new domain_exception_1.BadRequestException(`validatin error :: ${validationres.error}`, validationres.error.issues);
        req.validate = validationres.data;
        next();
    };
};
exports.validation = validation;
