import { LogoutEnum } from "../../common/enum/security.enum";
import { ConflictRequestException } from "../../common/exception/domain.exception";
import { Iuser } from "../../common/interface/user.interface";
import cacheService, {
  CahcheService,
} from "../../common/service/cache.service";
import { cloudService, CloudService } from "../../common/service/cloud.service";
import {
  JwtpayloadType,
  tokenService,
  TokenService,
} from "../../common/service/token.service";
import { IFile } from "../../common/types/multer.types";
import { ACCESS_TOKEN_EXPIERS_IN } from "../../config";
import { HUser } from "../../DB/model/user.model";

export class UserService {
  private tokenservice: TokenService;
  private cacheservicve: CahcheService;
  private readonly cloudService: CloudService;
  constructor() {
    this.tokenservice = tokenService;
    this.cacheservicve = cacheService;
    this.cloudService = cloudService;
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
  async profileImage(file: IFile, user: HUser): Promise<Iuser> {
    const oldImage = user.image;
    user.image = await this.cloudService.uploadAsset({
      file,
      path: `user/${user._id.toString()}/profile`,
    });
    await user.save();
    if (oldImage?.length) {
      await this.cloudService.deleteAsset({ Key: oldImage });
    }
    return user.toJSON();
  }

  async profileCoverImages(files: IFile[], user: HUser): Promise<Iuser> {
    const oldCover = user.coverImage || [];
    user.coverImage = await this.cloudService.uploadAssets({
      files,
      path: `user/${user._id.toString()}/profile/cover`,
    });
    await user.save();
    if (oldCover?.length) {
      await this.cloudService.deleteAssets({ Keys: oldCover });
    }
    return user.toJSON();
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
