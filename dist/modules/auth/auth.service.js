"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
const email_enum_1 = require("../../common/enum/email.enum");
const user_enum_1 = require("../../common/enum/user.enum");
const domain_exception_1 = require("../../common/exception/domain.exception");
const user_repositroy_1 = require("../../common/repository/user.repositroy");
const encryption_security_1 = require("../../common/security/encryption.security");
const hash_security_1 = require("../../common/security/hash.security");
const cache_service_1 = __importDefault(require("../../common/service/cache.service"));
const token_service_1 = require("../../common/service/token.service");
const email_event_1 = require("../../common/utils/email/email.event");
const send_email_1 = require("../../common/utils/email/send.email");
const otp_1 = require("../../common/utils/otp");
const config_1 = require("../../config");
class AuthService {
    userReposiroty;
    cacheService;
    tokenservice;
    client;
    constructor() {
        this.userReposiroty = new user_repositroy_1.UserRepository();
        this.cacheService = cache_service_1.default;
        this.tokenservice = token_service_1.tokenService;
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async verifyGoogleAccount(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: config_1.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified)
            throw new domain_exception_1.BadRequestException("email not Verified");
        return payload;
    }
    async signupWithGmail({ idToken }, issuer) {
        const { name, email, picture } = await this.verifyGoogleAccount(idToken);
        let status = 201;
        const existAcc = await this.userReposiroty.findOne({
            filter: { email: email },
        });
        if (existAcc) {
            if (existAcc.provider != user_enum_1.ProviderEnum.GOOGLE) {
                throw new domain_exception_1.ConflictRequestException("user already exist");
            }
            status = 200;
            return {
                status: 200,
                data: await this.tokenservice.createLoginCredintials({
                    user: existAcc,
                    issuer,
                }),
            };
        }
        const user = await this.userReposiroty.createOne({
            data: {
                username: name,
                email,
                confirmEmail: new Date(),
                provider: user_enum_1.ProviderEnum.GOOGLE,
                image: picture,
            },
        });
        return {
            status: 201,
            data: await this.tokenservice.createLoginCredintials({ user, issuer }),
        };
    }
    async sendEmailOtp({ email, subject, expiersIn = 120, maxTrials = 3, blockInSeconds = 300, }) {
        const existOtp_TTl = await this.cacheService.ttl({
            key: (0, send_email_1.userEmailKey)({ email, subject }),
        });
        if (existOtp_TTl > 0) {
            throw new domain_exception_1.ConflictRequestException(`try again after ${existOtp_TTl}s`);
        }
        const oldTrials = (await this.cacheService.get({
            key: (0, send_email_1.userEmailTrialsKey)({ email, subject }),
        })) ?? 0;
        if (oldTrials >= maxTrials) {
            throw new domain_exception_1.TooManyRequestException("maximum otp trials has been reached try again after 24 hours");
        }
        const code = (0, otp_1.createOtp)();
        await this.cacheService.set({
            key: (0, send_email_1.userEmailKey)({ email, subject }),
            value: await (0, hash_security_1.hash)(code.toString()),
            ttl: expiersIn,
        });
        const currentTrials = await this.cacheService.incrBy({
            key: (0, send_email_1.userEmailTrialsKey)({ email, subject }),
        });
        if (currentTrials == maxTrials) {
            await this.cacheService.expire({
                key: (0, send_email_1.userEmailTrialsKey)({ email, subject }),
                ttl: blockInSeconds,
            });
        }
        email_event_1.emailEvent.emit("sendEmail", {
            recipients: { to: email },
            subject,
            data: { code, title: subject },
        });
    }
    async signup({ email, password, username, phone, gender, }) {
        const duplicated = await this.userReposiroty.findOne({
            filter: { email },
        });
        if (duplicated)
            throw new domain_exception_1.ConflictRequestException("duplicated account");
        const account = await this.userReposiroty.create({
            data: {
                email,
                password: await (0, hash_security_1.hash)(password),
                username,
                phone: await (0, encryption_security_1.encryption)(phone),
                gender,
            },
        });
        await this.sendEmailOtp({ email, subject: email_enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return account;
    }
    async confirmEmail({ otp, email }) {
        const account = await this.userReposiroty.findOne({
            filter: {
                email,
                provider: user_enum_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
        });
        if (!account)
            throw new domain_exception_1.NotFoundRequestException("invalid account");
        const hashOtp = await this.cacheService.get({
            key: (0, send_email_1.userEmailKey)({ email, subject: email_enum_1.EmailSubjectEnum.CONFIRM_EMAIL }),
        });
        if (!hashOtp || !(await (0, hash_security_1.compare)(otp, hashOtp))) {
            throw new domain_exception_1.ConflictRequestException("invalid otp");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.cacheService.del({
            key: await this.cacheService.keys({
                prefix: (0, send_email_1.userEmailKey)({
                    email,
                    subject: email_enum_1.EmailSubjectEnum.CONFIRM_EMAIL,
                }),
            }),
        });
        return account;
    }
    async resendConfirmEmail({ email, }) {
        const account = await this.userReposiroty.findOne({
            filter: {
                email,
                provider: user_enum_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
        });
        if (!account)
            throw new domain_exception_1.NotFoundRequestException("invalid account");
        await this.sendEmailOtp({ email, subject: email_enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return;
    }
    async login({ email, password }, issuer, maxTrials = 5, blockInSeconds = 300) {
        const account = await this.userReposiroty.findOne({
            filter: {
                email,
                provider: user_enum_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true },
            },
        });
        if (!account)
            throw new domain_exception_1.NotFoundRequestException("user not found");
        const match = await (0, hash_security_1.compare)(password, account.password);
        if (!match) {
            const oldTrials = (await this.cacheService.get({
                key: `User${email}::password::trial`,
            })) ?? 0;
            if (oldTrials >= maxTrials) {
                throw new domain_exception_1.TooManyRequestException("maximum password trials has been reached try again after 5 minutes");
            }
            const currentTrials = await this.cacheService.incrBy({
                key: `User${email}::password::trial`,
            });
            if (currentTrials == maxTrials) {
                await this.cacheService.expire({
                    key: `User${email}::password::trial`,
                    ttl: blockInSeconds,
                });
            }
            throw new domain_exception_1.NotFoundRequestException("incorrect password");
        }
        if (account.confirm2fa) {
            await this.sendEmailOtp({
                email,
                subject: email_enum_1.EmailSubjectEnum.STEP_VERIFICATION,
            });
            return;
        }
        await this.cacheService.del({ key: `User${email}::password::trial` });
        return await this.tokenservice.createLoginCredintials({
            user: account,
            issuer,
        });
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
