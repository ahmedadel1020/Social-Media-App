import { userModel } from "../../DB/model/user.model";
import { Iuser } from "../interface/user.interface";
import { DatabaseRepository } from "./base.repositroy";

export class UserRepository extends DatabaseRepository<Iuser> {
  constructor() {
    super(userModel);
  }
}

export default new UserRepository();
