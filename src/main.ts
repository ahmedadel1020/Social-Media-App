import express from "express";
import { authController } from "./modules/index";
import { globalErrorHandling } from "./middleware/error.middleware";
import { PORT } from "./config";
import { testConnection } from "./DB/connection.db";

const app = express();
app.use(express.json());
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

app.use("/auth", authController);
app.use(globalErrorHandling);
