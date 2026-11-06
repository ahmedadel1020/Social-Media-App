import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIERS_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIERS_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { tokenTypeEnum } from "../enum/security.enum";
import { RoleEnum } from "../enum/user.enum";
import userRepositroy, { UserRepository } from "../repository/user.repositroy";
import {
  BadRequestException,
  NotFoundRequestException,
  UnAuthorizedRequestException,
} from "../exception/domain.exception";
import { compare } from "../security/hash.security";
import { Iuser } from "../interface/user.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { randomUUID } from "node:crypto";

import cacheService, { CahcheService } from "./cache.service";
import { toObjectId } from "../utils";
import { HUser } from "../../DB/model/user.model";

type userIdType = mongoose.Types.ObjectId | string;
export type JwtpayloadType = JwtPayload & {
  sub: mongoose.Types.ObjectId | string;
  aud: number[];
  jti: string;
  iat: number;
};
export class TokenService {
  private readonly userRepository: UserRepository;
  private readonly cahcheService: CahcheService;
  constructor() {
    this.userRepository = userRepositroy;
    this.cahcheService = cacheService;
  }

  userBaseKey({ userid }: { userid: userIdType }): string {
    return `User::${userid.toString()}`;
  }

  userBaseRevokeTokenKey({ userid }: { userid: userIdType }): string {
    return `${this.userBaseKey({ userid })}::Revoke_Token`;
  }
  userRevokeTokenKey({
    userid,
    jti,
  }: {
    userid: userIdType;
    jti: string;
  }): string {
    return `${this.userBaseRevokeTokenKey({ userid })}${jti}`;
  }

  async createToken({
    payload,
    options,
    secret = ACCESS_USER_TOKEN_SIGNATURE,
  }: {
    payload: string | Buffer | object;
    secret: Secret;
    options?: SignOptions;
  }): Promise<string> {
    return jwt.sign(payload, secret, options);
  }

  async verifyToken({
    token,
    secret = ACCESS_USER_TOKEN_SIGNATURE,
  }: {
    token: string;
    secret: Secret;
  }): Promise<JwtpayloadType> {
    return jwt.verify(token, secret) as JwtpayloadType;
  }

  async getTokenSignature({
    role = RoleEnum.USER,
  }: {
    role: RoleEnum;
  }): Promise<{
    accessSignature: string;
    refreshSignature: string;
  }> {
    let signatures: { accessSignature: string; refreshSignature: string };
    switch (role) {
      case RoleEnum.ADMIN:
        signatures = {
          accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
          refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE,
        };
        break;

      default:
        signatures = {
          accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
          refreshSignature: REFRESH_USER_TOKEN_SIGNATURE,
        };
        break;
    }
    return signatures;
  }

  async getSignature({
    tokenType = tokenTypeEnum.ACCESS,
    role = RoleEnum.USER,
  }: {
    tokenType: tokenTypeEnum;
    role?: RoleEnum;
  }): Promise<string> {
    const signatures = await this.getTokenSignature({ role });
    return tokenType == tokenTypeEnum.ACCESS
      ? signatures.accessSignature
      : signatures.refreshSignature;
  }

  async decodeToken({
    authorization,
    tokenType = tokenTypeEnum.ACCESS,
  }: {
    authorization: string;
    tokenType: tokenTypeEnum;
  }): Promise<{ user: HUser; payload: JwtpayloadType }> {
    const decoded = jwt.decode(authorization) as JwtpayloadType;

    console.log({ decoded: decoded });

    if (!decoded.aud?.length) {
      throw new BadRequestException();
    }

    const payload = await this.verifyToken({
      token: authorization,
      secret: await this.getSignature({
        tokenType,
        role: decoded.aud[0] as unknown as RoleEnum,
      }),
    });
    if (!payload?.sub) throw new BadRequestException("Missing token payload");
    if (
      await this.cahcheService.exist({
        key: this.userRevokeTokenKey({ userid: payload.sub, jti: payload.jti }),
      })
    ) {
      throw new UnAuthorizedRequestException("expires login credentials");
    }
    const user = await this.userRepository.findById({
      id: toObjectId(payload.sub),
    });
    if (!user) throw new NotFoundRequestException("user not found");

    if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
      throw new UnAuthorizedRequestException("expires login credentials");
    }
    return { user, payload };
  }

  async createLoginCredintials({
    user,
    issuer,
  }: {
    user: HUser;
    issuer: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const { accessSignature, refreshSignature } = await this.getTokenSignature({
      role: user.role,
    });
    const jwtid = randomUUID();
    const access_token = await this.createToken({
      payload: { sub: user._id },
      options: {
        issuer,
        audience: [user.role as unknown as string],
        expiresIn: ACCESS_TOKEN_EXPIERS_IN,
        jwtid,
      },
      secret: accessSignature,
    });
    const refresh_token = await this.createToken({
      payload: { sub: user._id },
      options: {
        issuer,
        audience: [user.role as unknown as string],
        expiresIn: REFRESH_TOKEN_EXPIERS_IN,
        jwtid,
      },
      secret: refreshSignature,
    });
    return { access_token, refresh_token };
  }

  async createRevokeToken({ payload }: { payload: JwtpayloadType }) {
    const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
    const refreshExpiresIn = payload.iat - REFRESH_TOKEN_EXPIERS_IN;
    const ttl = refreshExpiresIn - consumedTime;
    await this.cahcheService.set({
      key: this.userRevokeTokenKey({ userid: payload.sub, jti: payload.jti }),
      value: payload.jti,
      ttl,
    });
    return;
  }

  async basicAuth({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<HUser> {
    const user = await this.userRepository.findOne({
      filter: { email },
    });
    if (!user) throw new NotFoundRequestException("user not found");
    const match = await compare(password, user.password);
    if (!match) throw new NotFoundRequestException("password mismatched");
    return user;
  }
}

export const tokenService = new TokenService();

/////////////////////
