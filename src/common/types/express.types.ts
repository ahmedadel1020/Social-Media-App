import { HUser } from "../../DB/model/user.model";
import { JwtpayloadType } from "../service/token.service";

declare module "express-serve-static-core" {
  interface Request {
    validate: any;
    user: HUser;
    payload: JwtpayloadType;
  }
}
