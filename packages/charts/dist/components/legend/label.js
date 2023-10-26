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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Label = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importStar(require("react"));
const common_1 = require("../../utils/common");
function Label({ label, isToggleable, onToggle, isSeriesHidden, options }) {
    const maxLines = Math.abs(options.maxLines);
    const labelClassNames = (0, classnames_1.default)('echLegendItem__label', {
        'echLegendItem__label--clickable': Boolean(onToggle),
        'echLegendItem__label--singleline': maxLines === 1,
        'echLegendItem__label--multiline': maxLines > 1,
    });
    const onClick = (0, react_1.useCallback)(({ shiftKey }) => onToggle === null || onToggle === void 0 ? void 0 : onToggle(shiftKey), [onToggle]);
    const onKeyDown = (0, react_1.useCallback)(({ key, shiftKey }) => {
        if (key === ' ' || key === 'Enter')
            onToggle === null || onToggle === void 0 ? void 0 : onToggle(shiftKey);
    }, [onToggle]);
    const dir = (0, common_1.isRTLString)(label) ? 'rtl' : 'ltr';
    const title = options.maxLines > 0 ? label : '';
    const clampStyles = maxLines > 1 ? { WebkitLineClamp: maxLines } : {};
    return isToggleable ? (react_1.default.createElement("div", { role: "button", tabIndex: 0, dir: dir, className: labelClassNames, title: title, onClick: onClick, onKeyDown: onKeyDown, "aria-pressed": isSeriesHidden, style: clampStyles, "aria-label": isSeriesHidden ? `${label}; Activate to show series in graph` : `${label}; Activate to hide series in graph` }, label)) : (react_1.default.createElement("div", { dir: dir, className: labelClassNames, title: label, style: clampStyles }, label));
}
exports.Label = Label;
//# sourceMappingURL=label.js.map