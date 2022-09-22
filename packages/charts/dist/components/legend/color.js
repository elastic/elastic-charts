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
exports.Color = void 0;
var react_1 = __importStar(require("react"));
var icon_1 = require("../icons/icon");
var legend_icon_1 = require("./legend_icon");
exports.Color = (0, react_1.memo)((0, react_1.forwardRef)(function (_a, ref) {
    var color = _a.color, seriesName = _a.seriesName, _b = _a.isSeriesHidden, isSeriesHidden = _b === void 0 ? false : _b, hasColorPicker = _a.hasColorPicker, onClick = _a.onClick, pointStyle = _a.pointStyle;
    if (isSeriesHidden) {
        return (react_1.default.createElement("div", { className: "echLegendItem__color", title: "series hidden" },
            react_1.default.createElement(icon_1.Icon, { type: "eyeClosed", viewBox: "-3 -3 22 22", "aria-label": "series ".concat(seriesName, " is hidden") })));
    }
    if (hasColorPicker) {
        return (react_1.default.createElement("button", { type: "button", onClick: onClick, className: "echLegendItem__color echLegendItem__color--changable", title: "change series color", ref: ref },
            react_1.default.createElement(legend_icon_1.LegendIcon, { pointStyle: pointStyle, color: color, ariaLabel: "Change series color, currently ".concat(color) })));
    }
    return (react_1.default.createElement("div", { className: "echLegendItem__color", title: "series color" },
        react_1.default.createElement(legend_icon_1.LegendIcon, { pointStyle: pointStyle, color: color, ariaLabel: "series color: ".concat(color) })));
}));
exports.Color.displayName = 'Color';
//# sourceMappingURL=color.js.map