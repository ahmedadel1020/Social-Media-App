import express from "express";
import { authController } from "./modules/index";
import { globalErrorHandling } from "./middleware/error.middleware";
import { PORT } from "./config";
import { testConnection } from "./DB/connection.db";
import { userModel } from "./DB/model/user.model";
import { ProviderEnum } from "./common/enum/user.enum";
import { cloudService } from "./common/service/cloud.service";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { notificationService } from "./common/service/notification.service";
const s3ResponsePipe = promisify(pipeline);
const app = express();
app.use(express.json());
app.use("/assets", express.static("./assets"));
testConnection(app, PORT);
app.all(
  "/",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response> => {
    return res.status(200).json({ message: "Done" });
  },
);
app.get(
  "/uploads/preSigned/*path",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const Key = (req.params.path as string[]).join("/");
    const {
      download = "false",
      filename = (req.params.path as string[]).pop(),
    } = req.query as {
      download?: "true" | "false";
      filename?: string;
    };
    const url = await cloudService.createPreSignedFetchLink({ Key });
    return res.status(200).json({ messgae: "done", url });
  },
);
app.get(
  "/uploads/*path",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const Key = (req.params.path as string[]).join("/");
    const {
      download = "false",
      filename = (req.params.path as string[]).pop(),
    } = req.query as {
      download?: "true" | "false";
      filename?: string;
    };
    const { Body } = await cloudService.getAsset({ Key });
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    if (download == "true") {
      res.setHeader(
        "content-Disposition",
        `attachment; filename="${filename}"`,
      );
    }
    return await s3ResponsePipe(Body as NodeJS.ReadableStream, res);
  },
);
app.post(
  "/send-notification",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response> => {
    const token = req.body.token;
    await notificationService.sendNotification({
      token,
      notification: {
        title: "test",
        body: "content",
      },
    });
    return res.status(200).json({ message: "Done" });
  },
);
app.use("/auth", authController);
app.use(globalErrorHandling);
