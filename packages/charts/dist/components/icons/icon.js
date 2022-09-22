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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importStar(require("react"));
var fast_deep_equal_1 = require("../../utils/fast_deep_equal");
var alert_1 = require("./assets/alert");
var dot_1 = require("./assets/dot");
var empty_1 = require("./assets/empty");
var eye_1 = require("./assets/eye");
var eye_closed_1 = require("./assets/eye_closed");
var list_1 = require("./assets/list");
var question_in_circle_1 = require("./assets/question_in_circle");
var typeToIconMap = {
    alert: alert_1.AlertIcon,
    dot: dot_1.DotIcon,
    empty: empty_1.EmptyIcon,
    eye: eye_1.EyeIcon,
    eyeClosed: eye_closed_1.EyeClosedIcon,
    list: list_1.ListIcon,
    questionInCircle: question_in_circle_1.QuestionInCircle,
};
function IconComponent(_a) {
    var type = _a.type, color = _a.color, className = _a.className, tabIndex = _a.tabIndex, rest = __rest(_a, ["type", "color", "className", "tabIndex"]);
    var optionalCustomStyles = null;
    if (color) {
        optionalCustomStyles = { color: color };
    }
    var classes = (0, classnames_1.default)('echIcon', className);
    var Svg = (type && typeToIconMap[type]) || empty_1.EmptyIcon;
    var focusable = tabIndex === undefined || tabIndex === -1 ? 'false' : 'true';
    return react_1.default.createElement(Svg, __assign({ className: classes }, optionalCustomStyles, { tabIndex: tabIndex, focusable: focusable }, rest));
}
IconComponent.displayName = 'Icon';
exports.Icon = (0, react_1.memo)(IconComponent, fast_deep_equal_1.deepEqual);
//# sourceMappingURL=icon.js.map