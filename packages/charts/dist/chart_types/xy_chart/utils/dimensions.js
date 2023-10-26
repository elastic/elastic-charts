"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartDimensions = void 0;
const axes_sizes_1 = require("../axes/axes_sizes");
function computeChartDimensions(parentDimensions, theme, axisTickDimensions, axesStyles, axisSpecs, smSpec) {
    const axesDimensions = (0, axes_sizes_1.getAxesDimensions)(theme, axisTickDimensions, axesStyles, axisSpecs, smSpec);
    const chartWidth = parentDimensions.width - axesDimensions.left - axesDimensions.right;
    const chartHeight = parentDimensions.height - axesDimensions.top - axesDimensions.bottom;
    const pad = theme.chartPaddings;
    return {
        leftMargin: axesDimensions.margin.left,
        chartDimensions: {
            top: axesDimensions.top + pad.top,
            left: axesDimensions.left + pad.left,
            width: Math.max(0, chartWidth - pad.left - pad.right),
            height: Math.max(0, chartHeight - pad.top - pad.bottom),
        },
    };
}
exports.computeChartDimensions = computeChartDimensions;
//# sourceMappingURL=dimensions.js.map