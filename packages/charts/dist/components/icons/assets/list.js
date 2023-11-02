"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListIcon = void 0;
const react_1 = __importDefault(require("react"));
function ListIcon(extraProps) {
    return (react_1.default.createElement("svg", { width: 16, height: 16, xmlns: "http://www.w3.org/2000/svg", ...extraProps },
        react_1.default.createElement("path", { d: "M2 4V3h2v1H2zm4 0V3h8v1H6zm0 3V6h8v1H6zm0 3V9h8v1H6zM2 7V6h2v1H2zm0 3V9h2v1H2zm4 3v-1h8v1H6zm-4 0v-1h2v1H2z" })));
}
exports.ListIcon = ListIcon;
//# sourceMappingURL=list.js.map