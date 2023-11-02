"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGracefulError = exports.GracefulError = exports.ErrorType = void 0;
exports.ErrorType = Object.freeze({
    Graceful: 'graceful',
});
class GracefulError extends Error {
    constructor() {
        super(...arguments);
        this.type = exports.ErrorType.Graceful;
    }
}
exports.GracefulError = GracefulError;
function isGracefulError(error) {
    return (error === null || error === void 0 ? void 0 : error.type) === exports.ErrorType.Graceful;
}
exports.isGracefulError = isGracefulError;
//# sourceMappingURL=errors.js.map