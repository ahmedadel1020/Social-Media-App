"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const security_enum_1 = require("../../common/enum/security.enum");
const domain_exception_1 = require("../../common/exception/domain.exception");
const cache_service_1 = __importDefault(require("../../common/service/cache.service"));
const token_service_1 = require("../../common/service/token.service");
const config_1 = require("../../config");
class UserService {
    tokenservice;
    cacheservicve;
    constructor() {
        this.tokenservice = token_service_1.tokenService;
        this.cacheservicve = cache_service_1.default;
    }
    async rotateToken(payload, user, issuer) {
        const accessExpiresIn = (payload.iat + config_1.ACCESS_TOKEN_EXPIERS_IN) * 1000;
        const currenttime = 30 * 60000 + Date.now();
        if (currenttime < accessExpiresIn) {
            throw new domain_exception_1.ConflictRequestException();
        }
        const data = await this.tokenservice.createLoginCredintials({
            user,
            issuer,
        });
        await this.tokenservice.createRevokeToken({ payload });
        return data;
    }
    async logout(payload, user, { action = security_enum_1.LogoutEnum.DEVICE }) {
        switch (action) {
            case security_enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cacheservicve.del({
                    key: await this.cacheservicve.keys({
                        prefix: this.tokenservice.userBaseRevokeTokenKey({
                            userid: payload.sub,
                        }),
                    }),
                });
                break;
            default:
                await this.tokenservice.createRevokeToken({ payload });
                break;
        }
        return;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
