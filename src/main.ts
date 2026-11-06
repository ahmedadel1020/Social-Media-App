import express from "express";
import { authController } from "./modules/index";
import { globalErrorHandling } from "./middleware/error.middleware";
import { PORT } from "./config";
import { testConnection } from "./DB/connection.db";
import { userModel } from "./DB/model/user.model";
import { ProviderEnum } from "./common/enum/user.enum";

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

app.use("/auth", authController);
app.use(globalErrorHandling);

async function test() {
  const user = new userModel({
    firstName: "ahmed",
    lastName: "adel",
    email: `${Date.now()}@mail.com`,
    password: "akdjhd",
    phone: "+201143883511",
    provider: ProviderEnum.SYSTEM,
  });
  await user.save();

  await user.save();
}

test();
