"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGracefulError = exports.GracefulError = exports.ErrorType = void 0;
exports.ErrorType = Object.freeze({
    Graceful: 'graceful',
});
var GracefulError = (function (_super) {
    __extends(GracefulError, _super);
    function GracefulError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = exports.ErrorType.Graceful;
        return _this;
    }
    return GracefulError;
}(Error));
exports.GracefulError = GracefulError;
function isGracefulError(error) {
    return (error === null || error === void 0 ? void 0 : error.type) === exports.ErrorType.Graceful;
}
exports.isGracefulError = isGracefulError;
//# sourceMappingURL=errors.js.map