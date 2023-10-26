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
exports.Icon = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importStar(require("react"));
const alert_1 = require("./assets/alert");
const dot_1 = require("./assets/dot");
const empty_1 = require("./assets/empty");
const eye_1 = require("./assets/eye");
const eye_closed_1 = require("./assets/eye_closed");
const list_1 = require("./assets/list");
const question_in_circle_1 = require("./assets/question_in_circle");
const fast_deep_equal_1 = require("../../utils/fast_deep_equal");
const typeToIconMap = {
    alert: alert_1.AlertIcon,
    dot: dot_1.DotIcon,
    empty: empty_1.EmptyIcon,
    eye: eye_1.EyeIcon,
    eyeClosed: eye_closed_1.EyeClosedIcon,
    list: list_1.ListIcon,
    questionInCircle: question_in_circle_1.QuestionInCircle,
};
function IconComponent({ type, color, className, tabIndex, ...rest }) {
    let optionalCustomStyles = null;
    if (color) {
        optionalCustomStyles = { color };
    }
    const classes = (0, classnames_1.default)('echIcon', className);
    const Svg = (type && typeToIconMap[type]) || empty_1.EmptyIcon;
    const focusable = tabIndex === undefined || tabIndex === -1 ? 'false' : 'true';
    return react_1.default.createElement(Svg, { className: classes, ...optionalCustomStyles, tabIndex: tabIndex, focusable: focusable, ...rest });
}
IconComponent.displayName = 'Icon';
exports.Icon = (0, react_1.memo)(IconComponent, fast_deep_equal_1.deepEqual);
//# sourceMappingURL=icon.js.map