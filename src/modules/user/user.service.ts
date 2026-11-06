import { LogoutEnum } from "../../common/enum/security.enum";
import { ConflictRequestException } from "../../common/exception/domain.exception";
import cacheService, {
  CahcheService,
} from "../../common/service/cache.service";
import {
  JwtpayloadType,
  tokenService,
  TokenService,
} from "../../common/service/token.service";
import { ACCESS_TOKEN_EXPIERS_IN } from "../../config";
import { HUser } from "../../DB/model/user.model";

export class UserService {
  private tokenservice: TokenService;
  private cacheservicve: CahcheService;
  constructor() {
    this.tokenservice = tokenService;
    this.cacheservicve = cacheService;
  }

  async rotateToken(payload: JwtpayloadType, user: HUser, issuer: string) {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIERS_IN) * 1000;
    const currenttime = 30 * 60000 + Date.now();
    if (currenttime < accessExpiresIn) {
      throw new ConflictRequestException();
    }
    const data = await this.tokenservice.createLoginCredintials({
      user,
      issuer,
    });
    await this.tokenservice.createRevokeToken({ payload });
    return data;
  }

  async logout(
    payload: JwtpayloadType,
    user: HUser,
    { action = LogoutEnum.DEVICE }: { action: LogoutEnum },
  ) {
    switch (action) {
      case LogoutEnum.ALL:
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

export const userService = new UserService();
