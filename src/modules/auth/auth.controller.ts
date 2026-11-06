import { NextFunction, Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { ResponseFormatter } from "../../middleware/response.middleware";
import { validation } from "../../middleware/validation.middleware";
import * as validators from "./auth.validation";
import { getIssuer } from "../../common/utils/issuer";
import { IResponse } from "../../common/interface/response.interface";
import {
  ILoginResponse,
  ISignupWithGmailResponse,
} from "./entities/auth.entities";
import { Iuser } from "../../common/interface/user.interface";
const router = Router();
router.post(
  "/signup",
  validation(validators.signup),
  ResponseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<Iuser>> => {
      const data = await AuthService.signup(req.validate.body);
      return { status: 200, data };
    },
  ),
);

router.post(
  "/signup-with-gmail",
  ResponseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<ISignupWithGmailResponse>> => {
      const data = await AuthService.signupWithGmail(req.body, getIssuer(req));
      return { status: 200, data };
    },
  ),
);

router.post(
  "/login",
  validation(validators.login),
  ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await AuthService.login(req.validate.body, getIssuer(req));
    return { status: 200, data };
  }),
);

router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    return await AuthService.confirmEmail(req.validate.body);
  }),
);

router.patch(
  "/resend-confirm-email",
  validation(validators.resendConfirmEmail),
  ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    return await AuthService.resendConfirmEmail(req.validate.body);
  }),
);
export default router;
