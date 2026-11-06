"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../middleware/authentication.middleware");
const response_middleware_1 = require("../../middleware/response.middleware");
const security_enum_1 = require("../../common/enum/security.enum");
const user_service_1 = require("./user.service");
const issuer_1 = require("../../common/utils/issuer");
const router = (0, express_1.Router)();
router.get("/", (0, authentication_middleware_1.authentication)(), (0, response_middleware_1.ResponseFormatter)(async (req, res, next) => { }));
router.post("/rotate-token", (0, authentication_middleware_1.authentication)(security_enum_1.tokenTypeEnum.REFREH), (0, response_middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await user_service_1.userService.rotateToken(req.payload, req.user, (0, issuer_1.getIssuer)(req));
    return data;
}));
router.post("/logout", (0, authentication_middleware_1.authentication)(), (0, response_middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await user_service_1.userService.logout(req.payload, req.user, req.body);
    return data;
}));
exports.default = router;
