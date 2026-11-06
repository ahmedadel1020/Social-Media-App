import { OAuth2Client, TokenPayload } from "google-auth-library";
import { EmailSubjectEnum } from "../../common/enum/email.enum";
import { ProviderEnum } from "../../common/enum/user.enum";
import {
  BadRequestException,
  ConflictRequestException,
  NotFoundRequestException,
  TooManyRequestException,
} from "../../common/exception/domain.exception";
import { Iuser } from "../../common/interface/user.interface";
import { UserRepository } from "../../common/repository/user.repositroy";
import { encryption } from "../../common/security/encryption.security";
import { compare, hash } from "../../common/security/hash.security";
import cacheService, {
  CahcheService,
} from "../../common/service/cache.service";
import { tokenService, TokenService } from "../../common/service/token.service";
import { emailEvent } from "../../common/utils/email/email.event";
import {
  userEmailKey,
  userEmailTrialsKey,
} from "../../common/utils/email/send.email";
import { createOtp } from "../../common/utils/otp";
import { HUser } from "../../DB/model/user.model";
import {
  ConfirmEmailDto,
  LoginDto,
  resendConfirmEmailDto,
  SignupDto,
} from "./dto/auth.dto";
import {
  ILoginResponse,
  ISignupWithGmailResponse,
} from "./entities/auth.entities";
import { WEB_CLIENT_ID } from "../../config";

export class AuthService {
  private userReposiroty: UserRepository;
  private cacheService: CahcheService;
  private tokenservice: TokenService;
  private client: OAuth2Client;
  constructor() {
    this.userReposiroty = new UserRepository();
    this.cacheService = cacheService;
    this.tokenservice = tokenService;
    this.client = new OAuth2Client();
  }

  async verifyGoogleAccount(idToken: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified)
      throw new BadRequestException("email not Verified");
    return payload;
  }

  async signupWithGmail(
    { idToken }: { idToken: string },
    issuer: string,
  ): Promise<ISignupWithGmailResponse> {
    const { name, email, picture } = await this.verifyGoogleAccount(idToken);
    let status = 201;
    const existAcc = await this.userReposiroty.findOne({
      filter: { email: email as string },
    });
    if (existAcc) {
      if (existAcc.provider != ProviderEnum.GOOGLE) {
        throw new ConflictRequestException("user already exist");
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
        provider: ProviderEnum.GOOGLE,
        image: picture,
      },
    });
    return {
      status: 201,
      data: await this.tokenservice.createLoginCredintials({ user, issuer }),
    };
  }

  async sendEmailOtp({
    email,
    subject,
    expiersIn = 120,
    maxTrials = 3,
    blockInSeconds = 300,
  }: {
    email: string;
    subject: EmailSubjectEnum;
    expiersIn?: number;
    maxTrials?: number;
    blockInSeconds?: number;
  }) {
    const existOtp_TTl = await this.cacheService.ttl({
      key: userEmailKey({ email, subject }),
    });
    if (existOtp_TTl > 0) {
      throw new ConflictRequestException(`try again after ${existOtp_TTl}s`);
    }
    const oldTrials =
      (await this.cacheService.get({
        key: userEmailTrialsKey({ email, subject }),
      })) ?? 0;
    if (oldTrials >= maxTrials) {
      throw new TooManyRequestException(
        "maximum otp trials has been reached try again after 24 hours",
      );
    }
    const code = createOtp();
    await this.cacheService.set({
      key: userEmailKey({ email, subject }),
      value: await hash(code.toString()),
      ttl: expiersIn,
    });
    const currentTrials = await this.cacheService.incrBy({
      key: userEmailTrialsKey({ email, subject }),
    });
    if (currentTrials == maxTrials) {
      await this.cacheService.expire({
        key: userEmailTrialsKey({ email, subject }),
        ttl: blockInSeconds,
      });
    }
    emailEvent.emit("sendEmail", {
      recipients: { to: email },
      subject,
      data: { code, title: subject },
    });
  }
  async signup({
    email,
    password,
    username,
    phone,
    gender,
  }: SignupDto["body"]): Promise<Iuser> {
    const duplicated = await this.userReposiroty.findOne({
      filter: { email },
    });
    if (duplicated) throw new ConflictRequestException("duplicated account");
    const account = await this.userReposiroty.create({
      data: {
        email,
        password: await hash(password),
        username,
        phone: await encryption(phone),
        gender,
      },
    });
    await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
    return account;
  }

  async confirmEmail({ otp, email }: ConfirmEmailDto["body"]): Promise<Iuser> {
    const account = await this.userReposiroty.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: false },
      },
    });
    if (!account) throw new NotFoundRequestException("invalid account");
    const hashOtp = await this.cacheService.get({
      key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
    });

    if (!hashOtp || !(await compare(otp, hashOtp))) {
      throw new ConflictRequestException("invalid otp");
    }
    account.confirmEmail = new Date();
    await account.save();
    await this.cacheService.del({
      key: await this.cacheService.keys({
        prefix: userEmailKey({
          email,
          subject: EmailSubjectEnum.CONFIRM_EMAIL,
        }),
      }),
    });
    return account;
  }
  async resendConfirmEmail({
    email,
  }: resendConfirmEmailDto["body"]): Promise<void> {
    const account = await this.userReposiroty.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: false },
      },
    });
    if (!account) throw new NotFoundRequestException("invalid account");
    await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
    return;
  }

  async login(
    { email, password }: LoginDto["body"],
    issuer: string,
    maxTrials: number = 5,
    blockInSeconds: number = 300,
  ): Promise<ILoginResponse | undefined> {
    const account = await this.userReposiroty.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: true },
      },
    });
    if (!account) throw new NotFoundRequestException("user not found");
    const match = await compare(password, account.password);

    if (!match) {
      const oldTrials =
        (await this.cacheService.get({
          key: `User${email}::password::trial`,
        })) ?? 0;
      if (oldTrials >= maxTrials) {
        throw new TooManyRequestException(
          "maximum password trials has been reached try again after 5 minutes",
        );
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
      throw new NotFoundRequestException("incorrect password");
    }

    if (account.confirm2fa) {
      await this.sendEmailOtp({
        email,
        subject: EmailSubjectEnum.STEP_VERIFICATION,
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

export default new AuthService();
