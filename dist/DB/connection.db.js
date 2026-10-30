"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const testConnection = async (app, port) => {
    try {
        await mongoose_1.default.connect(config_1.DB_URI, { serverSelectionTimeoutMS: 30000 });
        console.log("db connect successfully");
        app.listen(port, () => console.log(`app is running on ${port}`));
    }
    catch (error) {
        console.log("failed to connect on DB");
        console.log(error);
    }
};
exports.testConnection = testConnection;
