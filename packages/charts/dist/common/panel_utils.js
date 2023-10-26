"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPointerInsideChart = exports.isPointerOverPanelFn = exports.getPanelTitle = exports.hasSMDomain = exports.getPanelSize = exports.getPerPanelMap = void 0;
const common_1 = require("../utils/common");
function getPerPanelMap(scales, fn) {
    const { horizontal, vertical } = scales;
    return vertical.domain.reduce((acc, verticalValue) => {
        return [
            ...acc,
            ...horizontal.domain.reduce((hAcc, horizontalValue) => {
                const panelAnchor = {
                    x: horizontal.scale(horizontalValue) || 0,
                    y: vertical.scale(verticalValue) || 0,
                };
                const fnReturn = fn(panelAnchor, horizontalValue, verticalValue, scales);
                return fnReturn ? [...hAcc, { panelAnchor, horizontalValue, verticalValue, ...fnReturn }] : hAcc;
            }, []),
        ];
    }, []);
}
exports.getPerPanelMap = getPerPanelMap;
function getPanelSize({ horizontal, vertical }) {
    return { width: horizontal.bandwidth, height: vertical.bandwidth };
}
exports.getPanelSize = getPanelSize;
const hasSMDomain = ({ domain }) => domain.length > 0 && domain[0] !== undefined;
exports.hasSMDomain = hasSMDomain;
const getPanelTitle = (isVertical, verticalValue, horizontalValue, groupBy) => {
    var _a, _b;
    return isVertical
        ? (0, common_1.safeFormat)(`${verticalValue}`, (_a = groupBy === null || groupBy === void 0 ? void 0 : groupBy.vertical) === null || _a === void 0 ? void 0 : _a.format)
        : (0, common_1.safeFormat)(`${horizontalValue}`, (_b = groupBy === null || groupBy === void 0 ? void 0 : groupBy.horizontal) === null || _b === void 0 ? void 0 : _b.format);
};
exports.getPanelTitle = getPanelTitle;
const isPointerOverPanelFn = (smScales, chartDimensions, gridStroke) => (pointer) => {
    return ((0, exports.isPointerInsideChart)(chartDimensions)(pointer) &&
        isPointerInBandwidth(smScales.horizontal, pointer.x - chartDimensions.left, gridStroke) &&
        isPointerInBandwidth(smScales.vertical, pointer.y - chartDimensions.top, gridStroke));
};
exports.isPointerOverPanelFn = isPointerOverPanelFn;
function isPointerInBandwidth(scale, dimension, gridStroke) {
    const { bandwidth, innerPadding } = scale;
    const padding = innerPadding * bandwidth;
    const divisor = bandwidth + padding + gridStroke * 2;
    const vDiv = Math.floor(dimension / divisor);
    const lower = vDiv * divisor;
    const upper = lower + bandwidth + gridStroke * 2;
    return dimension > lower && dimension <= upper;
}
const isPointerInsideChart = ({ left, top, height, width }) => ({ x, y }) => x > left && x < left + width && y > top && y < top + height;
exports.isPointerInsideChart = isPointerInsideChart;
//# sourceMappingURL=panel_utils.js.map