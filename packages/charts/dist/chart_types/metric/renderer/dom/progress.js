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
exports.ProgressBar = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var common_1 = require("../../../../utils/common");
var ProgressBar = function (_a) {
    var _b = _a.datum, title = _b.title, domainMax = _b.domainMax, value = _b.value, color = _b.color, progressBarDirection = _b.progressBarDirection, barBackground = _a.barBackground;
    var verticalDirection = progressBarDirection === common_1.LayoutDirection.Vertical;
    var isSmall = true;
    var percent = Number((0, common_1.clamp)((value / domainMax) * 100, 0, 100).toFixed(1));
    var bgClassName = (0, classnames_1.default)('echSingleMetricProgress', {
        'echSingleMetricProgress--vertical': verticalDirection,
        'echSingleMetricProgress--horizontal': !verticalDirection,
        'echSingleMetricProgress--small': isSmall,
    });
    var barClassName = (0, classnames_1.default)('echSingleMetricProgressBar', {
        'echSingleMetricProgressBar--vertical': verticalDirection,
        'echSingleMetricProgressBar--horizontal': !verticalDirection,
        'echSingleMetricProgressBar--small': isSmall,
    });
    var percentProp = verticalDirection ? { height: "".concat(percent, "%") } : { width: "".concat(percent, "%") };
    return (react_1.default.createElement("div", { className: bgClassName, style: { backgroundColor: isSmall ? barBackground : undefined } },
        react_1.default.createElement("div", { className: barClassName, style: __assign({ backgroundColor: color }, percentProp), role: "meter", "aria-label": title ? "Percentage of ".concat(title) : 'Percentage', "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent })));
};
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=progress.js.map