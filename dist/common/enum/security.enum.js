"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutEnum = exports.LanguageEnum = exports.tokenTypeEnum = void 0;
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum[tokenTypeEnum["ACCESS"] = 0] = "ACCESS";
    tokenTypeEnum[tokenTypeEnum["REFREH"] = 1] = "REFREH";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
var LanguageEnum;
(function (LanguageEnum) {
    LanguageEnum[LanguageEnum["AR"] = 0] = "AR";
    LanguageEnum[LanguageEnum["EN"] = 1] = "EN";
})(LanguageEnum || (exports.LanguageEnum = LanguageEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum[LogoutEnum["DEVICE"] = 0] = "DEVICE";
    LogoutEnum[LogoutEnum["ALL"] = 1] = "ALL";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
