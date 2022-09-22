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
exports.AlertIcon = void 0;
var react_1 = __importDefault(require("react"));
function AlertIcon(extraProps) {
    return (react_1.default.createElement("svg", __assign({ xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16" }, extraProps),
        react_1.default.createElement("path", { fillRule: "evenodd", d: "M8.378 1.496l6.695 10.984A1 1 0 0 1 14.22 14H1.667a1 1 0 0 1-.883-1.47L6.642 1.545a1 1 0 0 1 1.736-.05zm-.853.52L1.667 13h12.552L7.525 2.016zM7.14 10.06L6.9 5.18h1.3l-.25 4.878h-.81zm.394 1.901a.61.61 0 0 1-.448-.186.606.606 0 0 1-.186-.444c0-.174.062-.323.186-.446a.614.614 0 0 1 .448-.184c.169 0 .315.06.44.182.124.122.186.27.186.448a.6.6 0 0 1-.189.446.607.607 0 0 1-.437.184z" })));
}
exports.AlertIcon = AlertIcon;
//# sourceMappingURL=alert.js.map