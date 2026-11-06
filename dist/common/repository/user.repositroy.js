"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_1 = require("../../DB/model/user.model");
const base_repositroy_1 = require("./base.repositroy");
class UserRepository extends base_repositroy_1.DatabaseRepository {
    constructor() {
        super(user_model_1.userModel);
    }
}
exports.UserRepository = UserRepository;
exports.default = new UserRepository();
