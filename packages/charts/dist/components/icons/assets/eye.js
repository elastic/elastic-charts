"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EyeIcon = void 0;
var react_1 = __importDefault(require("react"));
function EyeIcon(extraProps) {
    return (react_1.default.createElement("svg", __assign({ xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16" }, extraProps),
        react_1.default.createElement("path", { d: "M15.98 7.873c.013.03.02.064.02.098v.06a.24.24 0 0 1-.02.097C15.952 8.188 13.291 14 8 14S.047 8.188.02 8.128A.24.24 0 0 1 0 8.03v-.059c0-.034.007-.068.02-.098C.048 7.813 2.709 2 8 2s7.953 5.813 7.98 5.873zm-1.37-.424a12.097 12.097 0 0 0-1.385-1.862C11.739 3.956 9.999 3 8 3c-2 0-3.74.956-5.225 2.587a12.098 12.098 0 0 0-1.701 2.414 12.095 12.095 0 0 0 1.7 2.413C4.26 12.043 6.002 13 8 13s3.74-.956 5.225-2.587A12.097 12.097 0 0 0 14.926 8c-.08-.15-.189-.343-.315-.551zM8 4.75A3.253 3.253 0 0 1 11.25 8 3.254 3.254 0 0 1 8 11.25 3.253 3.253 0 0 1 4.75 8 3.252 3.252 0 0 1 8 4.75zm0 1C6.76 5.75 5.75 6.76 5.75 8S6.76 10.25 8 10.25 10.25 9.24 10.25 8 9.24 5.75 8 5.75zm0 1.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" })));
}
exports.EyeIcon = EyeIcon;
//# sourceMappingURL=eye.js.map