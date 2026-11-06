"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = exports.bearerAuth = void 0;
const security_enum_1 = require("../common/enum/security.enum");
const token_service_1 = require("../common/service/token.service");
const domain_exception_1 = require("../common/exception/domain.exception");
const bearerAuth = async ({ req, tokenType = security_enum_1.tokenTypeEnum.ACCESS, }) => {
    const [key, credential] = (req.headers["authorization"]?.split(" ") ||
        []);
    const { user, payload } = await token_service_1.tokenService.decodeToken({
        authorization: credential,
        tokenType,
    });
    req.user = user;
    req.payload = payload;
};
exports.bearerAuth = bearerAuth;
const authentication = (tokenType = security_enum_1.tokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new domain_exception_1.UnAuthorizedRequestException("Unauthorized Account");
        }
        const [key, credential] = authorization.split(" ") || [];
        console.log(key, credential);
        switch (key) {
            case "Basic":
                const [email, password] = Buffer.from(credential, "base64")
                    .toString()
                    ?.split(":");
                req.user = await token_service_1.tokenService.basicAuth({ email, password });
                break;
            case "Bearer":
                await (0, exports.bearerAuth)({ req, tokenType });
                break;
            default:
                throw new domain_exception_1.BadRequestException("invalid authentication approach");
                break;
        }
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) {
            throw new domain_exception_1.ForbiddenRequestException("not allowed");
        }
        next();
    };
};
exports.authorization = authorization;
