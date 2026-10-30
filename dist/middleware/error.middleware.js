"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = void 0;
const globalErrorHandling = (error, req, res, next) => {
    return res.status(error.status ?? 500).json({
        error,
        error_message: error.message || "something went wrong",
        stack: error.stack,
        cause: error.cause,
    });
};
exports.globalErrorHandling = globalErrorHandling;
