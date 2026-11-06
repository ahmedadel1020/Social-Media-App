"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./modules/index");
const error_middleware_1 = require("./middleware/error.middleware");
const config_1 = require("./config");
const connection_db_1 = require("./DB/connection.db");
const user_model_1 = require("./DB/model/user.model");
const user_enum_1 = require("./common/enum/user.enum");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/assets", express_1.default.static("./assets"));
(0, connection_db_1.testConnection)(app, config_1.PORT);
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use("/auth", index_1.authController);
app.use(error_middleware_1.globalErrorHandling);
async function test() {
    const user = new user_model_1.userModel({
        firstName: "ahmed",
        lastName: "adel",
        email: `${Date.now()}@mail.com`,
        password: "akdjhd",
        phone: "+201143883511",
        provider: user_enum_1.ProviderEnum.SYSTEM,
    });
    await user.save();
    await user.save();
}
test();
