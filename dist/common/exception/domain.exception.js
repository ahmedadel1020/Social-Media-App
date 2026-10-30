"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestException = exports.ForbiddenRequestException = exports.UnAuthorizedRequestException = exports.NotFoundRequestException = exports.ConflictRequestException = exports.BadRequestException = void 0;
const main_exception_1 = require("./main.exception");
class BadRequestException extends main_exception_1.ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class ConflictRequestException extends main_exception_1.ApplicationException {
    constructor(message = "ConflictRequest", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictRequestException = ConflictRequestException;
class NotFoundRequestException extends main_exception_1.ApplicationException {
    constructor(message = "NotFoundRequest", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundRequestException = NotFoundRequestException;
class UnAuthorizedRequestException extends main_exception_1.ApplicationException {
    constructor(message = "UnAuthorizedRequest", cause) {
        super(message, 401, cause);
    }
}
exports.UnAuthorizedRequestException = UnAuthorizedRequestException;
class ForbiddenRequestException extends main_exception_1.ApplicationException {
    constructor(message = "ForbiddenRequest", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenRequestException = ForbiddenRequestException;
class TooManyRequestException extends main_exception_1.ApplicationException {
    constructor(message = "TooManyRequest", cause) {
        super(message, 429, cause);
    }
}
exports.TooManyRequestException = TooManyRequestException;
