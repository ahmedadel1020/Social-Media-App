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
import {
  CahcheService,
  cacheService,
} from "../../common/service/cache.service";
import { emailEvent } from "../../common/utils/email/email.event";
import {
  userEmailKey,
  userEmailTrialsKey,
} from "../../common/utils/email/send.email";
import { createOtp } from "../../common/utils/otp";
import { HUser } from "../../DB/model/user.model";
import {
  ConfirmEmailDto,
  resendConfirmEmailDto,
  SignupDto,
} from "./dto/auth.dto";

export class AuthService {
  private userReposiroty: UserRepository;
  private cacheService: CahcheService;
  constructor() {
    this.userReposiroty = new UserRepository();
    this.cacheService = cacheService;
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
    account.confirmEmail = new Date() as unknown as string;
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
}

export default new AuthService();
