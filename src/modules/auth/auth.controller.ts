import { NextFunction, Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { ResponseFormatter } from "../../middleware/response.middleware";
import { validation } from "../../middleware/validation.middleware";
import * as validators from "./auth.validation";
const router = Router();
router.post(
  "/signup",
  validation(validators.signup),
  ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await AuthService.signup(req.validate.body);
    return { status: 200, message: "tets", data };
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
