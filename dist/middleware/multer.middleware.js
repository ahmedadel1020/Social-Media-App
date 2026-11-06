"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const local_multer_1 = require("../common/utils/multer/local.multer");
const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath = "general", validation, }) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
                return;
            }
            try {
                await (0, local_multer_1.processMulterUpload)({ customPath, validation, req, isRequired });
                next();
            }
            catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
            }
        });
    };
};
exports.uploadMiddleware = uploadMiddleware;
