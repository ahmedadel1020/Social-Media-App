import { NextFunction, Request, Response } from "express";
import { tokenTypeEnum } from "../common/enum/security.enum";
import { tokenService } from "../common/service/token.service";
import {
  BadRequestException,
  ForbiddenRequestException,
  UnAuthorizedRequestException,
} from "../common/exception/domain.exception";
import { RoleEnum } from "../common/enum/user.enum";

export const bearerAuth = async ({
  req,
  tokenType = tokenTypeEnum.ACCESS,
}: {
  req: Request;
  tokenType: tokenTypeEnum;
}) => {
  const [key, credential] = (req.headers["authorization"]?.split(" ") ||
    []) as [string, string];
  const { user, payload } = await tokenService.decodeToken({
    authorization: credential,
    tokenType,
  });
  req.user = user;
  req.payload = payload;
};

export const authentication = (tokenType = tokenTypeEnum.ACCESS) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnAuthorizedRequestException("Unauthorized Account");
    }
    const [key, credential] = authorization.split(" ") || [];
    console.log(key, credential);
    switch (key) {
      case "Basic":
        const [email, password] = Buffer.from(credential as string, "base64")
          .toString()
          ?.split(":") as [string, string];
        req.user = await tokenService.basicAuth({ email, password });
        break;
      case "Bearer":
        await bearerAuth({ req, tokenType });
        break;
      default:
        throw new BadRequestException("invalid authentication approach");
        break;
    }

    next();
  };
};

export const authorization = (accessRole: RoleEnum) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role < accessRole) {
      throw new ForbiddenRequestException("not allowed");
    }
    next();
  };
};
