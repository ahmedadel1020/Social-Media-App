import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIERS_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIERS_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config";
import jwt from "jsonwebtoken";
import { tokenTypeEnum } from "../enum/security.enum";
import { RoleEnum } from "../enum/user.enum";
import userRepositroy from "../repository/user.repositroy";
import {
  BadRequestException,
  NotFoundRequestException,
  UnAuthorizedRequestException,
} from "../exception/domain.exception";
import { compare } from "./hash.security";
import { Iuser } from "../interface/user.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { randomUUID } from "node:crypto";
import cacheService from "../service/cache.service";
export const createToken = async ({
  payload = {},
  options = {},
  secret = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = async ({
  token = "",
  secret = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.verify(token, secret);
};
const getTokenSignature = async ({
  role = RoleEnum.USER,
}: {
  role: RoleEnum;
}): Promise<{ accessSignature: string; refreshSignature: string }> => {
  let signatures;
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
};

const getSignature = async ({
  tokenType = tokenTypeEnum.ACCESS,
  role = RoleEnum.USER,
}: {
  tokenType?: tokenTypeEnum;
  role?: RoleEnum;
}) => {
  const signatures = await getTokenSignature({ role });
  return tokenType == tokenTypeEnum.ACCESS
    ? signatures.accessSignature
    : signatures.refreshSignature;
};

export const basicAuth = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Iuser> => {
  const user = await userRepositroy.findOne({
    filter: { email },
  });
  if (!user) throw new NotFoundRequestException("user not found");
  const match = await compare(password, user.password);
  if (!match) throw new NotFoundRequestException("password mismatched");
  return user;
};

export const userBaseKey = ({
  userid,
}: {
  userid: mongoose.Types.ObjectId;
}): string => {
  return `User::${userid.toString()}`;
};
export const userBaseRevokeTokenKey = ({
  userid,
}: {
  userid: mongoose.Types.ObjectId;
}): string => {
  return `${userBaseKey({ userid })}::Revoke_Token`;
};
export const userRevokeTokenKey = ({
  userid,
  jti,
}: {
  userid: mongoose.Types.ObjectId;
  jti: string;
}): string => {
  return `${userBaseRevokeTokenKey({ userid })}${jti}`;
};

export const createLoginCredintials = async ({
  user,
  issuer,
  options = {},
}: {
  user: HydratedDocument<Iuser>;
  issuer: string;
  options: any;
}): Promise<{ access_token: string; refresh_token: string }> => {
  const { accessSignature, refreshSignature } = await getTokenSignature({
    role: user.role,
  });
  const jwtid = randomUUID();
  const access_token = await createToken({
    payload: { sub: user._id },
    options: {
      ...options,
      issuer,
      audience: [user.role],
      expiresIn: ACCESS_TOKEN_EXPIERS_IN,
      jwtid,
    },
    secret: accessSignature,
  });
  const refresh_token = await createToken({
    payload: { sub: user._id },
    options: {
      ...options,
      issuer,
      audience: [user.role],
      expiresIn: REFRESH_TOKEN_EXPIERS_IN,
      jwtid,
    },
    secret: refreshSignature,
  });
  return { access_token, refresh_token };
};
/////////////////////

export const decodeToken = async ({
  authorization = "",
  tokenType = tokenTypeEnum.ACCESS,
}: {
  authorization: string;
  tokenType: tokenTypeEnum;
}) => {
  const decoded = jwt.decode(authorization);
  console.log({ decoded: decoded });
  if (!decoded.aud?.length) {
    throw new BadRequestException();
  }
  const payload = await verifyToken({
    token: authorization,
    secret: await getSignature({ tokenType }),
  });
  if (!payload?.sub) throw new BadRequestException();
  if (
    await cacheService.exist({
      key: userRevokeTokenKey({ userid: payload.sub, jti: payload.jti }),
    })
  ) {
    throw new UnAuthorizedRequestException("expires login credentials");
  }
  const user = await userRepositroy.findById({
    id: payload.sub,
  });
  if (!user) throw new NotFoundRequestException("user not found");

  if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
    throw new UnAuthorizedRequestException("expires login credentials");
  }
  return { user, payload };
};

export const createRevokeToken = async ({ payload }) => {
  const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
  const refreshExpiresIn = payload.iat - REFRESH_TOKEN_EXPIERS_IN;
  const ttl = refreshExpiresIn - consumedTime;
  await cacheService.set({
    key: userRevokeTokenKey({ userid: payload.sub, jti: payload.jti }),
    value: payload.jti,
    ttl,
  });
  return;
};
