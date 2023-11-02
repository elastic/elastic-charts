"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenReaderTypes = void 0;
const react_1 = __importDefault(require("react"));
function ScreenReaderTypes({ goalChartData, defaultSummaryId, chartTypeDescription, }) {
    if (!defaultSummaryId && !goalChartData)
        return null;
    const validGoalChart = chartTypeDescription === 'goal chart' ||
        chartTypeDescription === 'horizontalBullet chart' ||
        chartTypeDescription === 'verticalBullet chart';
    return (react_1.default.createElement("dl", null,
        react_1.default.createElement("dt", null, "Chart type:"),
        react_1.default.createElement("dd", { id: defaultSummaryId }, chartTypeDescription),
        validGoalChart && goalChartData && !isNaN(goalChartData.maximum) ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("dt", null, "Minimum:"),
            react_1.default.createElement("dd", null, goalChartData.minimum),
            react_1.default.createElement("dt", null, "Maximum:"),
            react_1.default.createElement("dd", null, goalChartData.maximum),
            react_1.default.createElement("dt", null, "Target:"),
            react_1.default.createElement("dd", null, goalChartData.target),
            react_1.default.createElement("dd", null, "Value:"),
            react_1.default.createElement("dt", null, goalChartData.value))) : null));
}
exports.ScreenReaderTypes = ScreenReaderTypes;
//# sourceMappingURL=types.js.map