"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const config_1 = require("../../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const security_enum_1 = require("../enum/security.enum");
const user_enum_1 = require("../enum/user.enum");
const user_repositroy_1 = __importDefault(require("../repository/user.repositroy"));
const domain_exception_1 = require("../exception/domain.exception");
const hash_security_1 = require("../security/hash.security");
const node_crypto_1 = require("node:crypto");
const cache_service_1 = __importDefault(require("./cache.service"));
const utils_1 = require("../utils");
class TokenService {
    userRepository;
    cahcheService;
    constructor() {
        this.userRepository = user_repositroy_1.default;
        this.cahcheService = cache_service_1.default;
    }
    userBaseKey({ userid }) {
        return `User::${userid.toString()}`;
    }
    userBaseRevokeTokenKey({ userid }) {
        return `${this.userBaseKey({ userid })}::Revoke_Token`;
    }
    userRevokeTokenKey({ userid, jti, }) {
        return `${this.userBaseRevokeTokenKey({ userid })}${jti}`;
    }
    async createToken({ payload, options, secret = config_1.ACCESS_USER_TOKEN_SIGNATURE, }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verifyToken({ token, secret = config_1.ACCESS_USER_TOKEN_SIGNATURE, }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    async getTokenSignature({ role = user_enum_1.RoleEnum.USER, }) {
        let signatures;
        switch (role) {
            case user_enum_1.RoleEnum.ADMIN:
                signatures = {
                    accessSignature: config_1.ACCESS_ADMIN_TOKEN_SIGNATURE,
                    refreshSignature: config_1.REFRESH_ADMIN_TOKEN_SIGNATURE,
                };
                break;
            default:
                signatures = {
                    accessSignature: config_1.ACCESS_USER_TOKEN_SIGNATURE,
                    refreshSignature: config_1.REFRESH_USER_TOKEN_SIGNATURE,
                };
                break;
        }
        return signatures;
    }
    async getSignature({ tokenType = security_enum_1.tokenTypeEnum.ACCESS, role = user_enum_1.RoleEnum.USER, }) {
        const signatures = await this.getTokenSignature({ role });
        return tokenType == security_enum_1.tokenTypeEnum.ACCESS
            ? signatures.accessSignature
            : signatures.refreshSignature;
    }
    async decodeToken({ authorization, tokenType = security_enum_1.tokenTypeEnum.ACCESS, }) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        console.log({ decoded: decoded });
        if (!decoded.aud?.length) {
            throw new domain_exception_1.BadRequestException();
        }
        const payload = await this.verifyToken({
            token: authorization,
            secret: await this.getSignature({
                tokenType,
                role: decoded.aud[0],
            }),
        });
        if (!payload?.sub)
            throw new domain_exception_1.BadRequestException("Missing token payload");
        if (await this.cahcheService.exist({
            key: this.userRevokeTokenKey({ userid: payload.sub, jti: payload.jti }),
        })) {
            throw new domain_exception_1.UnAuthorizedRequestException("expires login credentials");
        }
        const user = await this.userRepository.findById({
            id: (0, utils_1.toObjectId)(payload.sub),
        });
        if (!user)
            throw new domain_exception_1.NotFoundRequestException("user not found");
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new domain_exception_1.UnAuthorizedRequestException("expires login credentials");
        }
        return { user, payload };
    }
    async createLoginCredintials({ user, issuer, }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignature({
            role: user.role,
        });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_token = await this.createToken({
            payload: { sub: user._id },
            options: {
                issuer,
                audience: [user.role],
                expiresIn: config_1.ACCESS_TOKEN_EXPIERS_IN,
                jwtid,
            },
            secret: accessSignature,
        });
        const refresh_token = await this.createToken({
            payload: { sub: user._id },
            options: {
                issuer,
                audience: [user.role],
                expiresIn: config_1.REFRESH_TOKEN_EXPIERS_IN,
                jwtid,
            },
            secret: refreshSignature,
        });
        return { access_token, refresh_token };
    }
    async createRevokeToken({ payload }) {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
        const refreshExpiresIn = payload.iat - config_1.REFRESH_TOKEN_EXPIERS_IN;
        const ttl = refreshExpiresIn - consumedTime;
        await this.cahcheService.set({
            key: this.userRevokeTokenKey({ userid: payload.sub, jti: payload.jti }),
            value: payload.jti,
            ttl,
        });
        return;
    }
    async basicAuth({ email, password, }) {
        const user = await this.userRepository.findOne({
            filter: { email },
        });
        if (!user)
            throw new domain_exception_1.NotFoundRequestException("user not found");
        const match = await (0, hash_security_1.compare)(password, user.password);
        if (!match)
            throw new domain_exception_1.NotFoundRequestException("password mismatched");
        return user;
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
