import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { ResponseFormatter } from "../../middleware/response.middleware";
import { tokenTypeEnum } from "../../common/enum/security.enum";
import { userService } from "./user.service";
import { getIssuer } from "../../common/utils/issuer";
import da from "zod/v4/locales/da.js";
import { uploadMiddleware } from "../../middleware/multer.middleware";
import {
  fileValidation,
  localFileUpload,
} from "../../common/utils/multer/local.multer";
import { StorageApproachEnum } from "../../common/enum/multer.enum";
import { IFile } from "../../common/types/multer.types";
import { IResponse } from "../../common/interface/response.interface";
import { Iuser } from "../../common/interface/user.interface";

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

router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      storageApproach: StorageApproachEnum.MEMORY,
    }).single("attachment"),
    validation: fileValidation.image,
    customPath: "User",
  }),
  ResponseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<Iuser>> => {
      const data = await userService.profileImage(req.file as IFile, req.user);
      return { data };
    },
  ),
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
