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
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, connection_db_1.testConnection)(app, config_1.PORT);
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use("/auth", index_1.authController);
app.use(error_middleware_1.globalErrorHandling);
