"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
const ResponseFormatter = (handler) => {
    return async (req, res, next) => {
        const result = await handler(req, res, next);
        if (res.headersSent)
            return;
        return res.status(result?.status ?? 200).json({
            message: result?.message ?? "done",
            data: result?.data,
            extra: result?.extra,
        });
    };
};
exports.ResponseFormatter = ResponseFormatter;
