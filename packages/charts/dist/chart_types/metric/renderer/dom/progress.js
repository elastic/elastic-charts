"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const common_1 = require("../../../../utils/common");
const ProgressBar = ({ datum: { title, domainMax, value, color, progressBarDirection }, barBackground }) => {
    const verticalDirection = progressBarDirection === common_1.LayoutDirection.Vertical;
    const isSmall = true;
    const percent = Number((0, common_1.clamp)((value / domainMax) * 100, 0, 100).toFixed(1));
    const bgClassName = (0, classnames_1.default)('echSingleMetricProgress', {
        'echSingleMetricProgress--vertical': verticalDirection,
        'echSingleMetricProgress--horizontal': !verticalDirection,
        'echSingleMetricProgress--small': isSmall,
    });
    const barClassName = (0, classnames_1.default)('echSingleMetricProgressBar', {
        'echSingleMetricProgressBar--vertical': verticalDirection,
        'echSingleMetricProgressBar--horizontal': !verticalDirection,
        'echSingleMetricProgressBar--small': isSmall,
    });
    const percentProp = verticalDirection ? { height: `${percent}%` } : { width: `${percent}%` };
    return (react_1.default.createElement("div", { className: bgClassName, style: { backgroundColor: isSmall ? barBackground : undefined } },
        react_1.default.createElement("div", { className: barClassName, style: { backgroundColor: color, ...percentProp }, role: "meter", "aria-label": title ? `Percentage of ${title}` : 'Percentage', "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent })));
};
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=progress.js.map