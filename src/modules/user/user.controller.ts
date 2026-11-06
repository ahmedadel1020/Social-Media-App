import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { ResponseFormatter } from "../../middleware/response.middleware";
import { tokenTypeEnum } from "../../common/enum/security.enum";
import { userService } from "./user.service";
import { getIssuer } from "../../common/utils/issuer";
import da from "zod/v4/locales/da.js";

const router = Router();

router.get(
  "/",
  authentication(),
  ResponseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {},
  ),
);
router.post(
  "/rotate-token",
  authentication(tokenTypeEnum.REFREH),
  ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.rotateToken(
      req.payload,
      req.user,
      getIssuer(req),
    );
    return data;
  }),
);

router.post(
  "/logout",
  authentication(),
  ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.logout(req.payload, req.user, req.body);
    return data;
  }),
);
export default router;
