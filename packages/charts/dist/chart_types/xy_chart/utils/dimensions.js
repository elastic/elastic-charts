"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartDimensions = void 0;
var axes_sizes_1 = require("../axes/axes_sizes");
function computeChartDimensions(parentDimensions, theme, axisTickDimensions, axesStyles, axisSpecs, _a) {
    var _b = _a === void 0 ? [] : _a, _c = __read(_b, 1), smSpec = _c[0];
    var axesDimensions = (0, axes_sizes_1.getAxesDimensions)(theme, axisTickDimensions, axesStyles, axisSpecs, smSpec);
    var chartWidth = parentDimensions.width - axesDimensions.left - axesDimensions.right;
    var chartHeight = parentDimensions.height - axesDimensions.top - axesDimensions.bottom;
    var pad = theme.chartPaddings;
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