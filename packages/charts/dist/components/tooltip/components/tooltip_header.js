"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipHeader = void 0;
var react_1 = __importStar(require("react"));
var common_1 = require("../../../utils/common");
var TooltipHeaderInner = function (props) {
    if ('children' in props) {
        return react_1.default.createElement("div", { className: "echTooltip__header" }, (0, common_1.renderComplexChildren)(props.children));
    }
    var header = props.header, formatter = props.formatter;
    if (!header || !header.isVisible)
        return null;
    var formattedValue = formatter ? formatter(header) : header.formattedValue;
    if (!formattedValue)
        return null;
    return react_1.default.createElement("div", { className: "echTooltip__header" }, formattedValue);
};
exports.TooltipHeader = (0, react_1.memo)(TooltipHeaderInner);
//# sourceMappingURL=tooltip_header.js.map