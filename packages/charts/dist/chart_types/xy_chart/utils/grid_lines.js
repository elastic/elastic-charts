"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGridLineForHorizontalAxisAt = exports.getGridLineForVerticalAxisAt = exports.getGridLines = exports.HIDE_MINOR_TIME_GRID = exports.OUTSIDE_RANGE_TOLERANCE = exports.HIERARCHICAL_GRID_WIDTH = void 0;
const axis_type_utils_1 = require("./axis_type_utils");
const color_library_wrappers_1 = require("../../../common/color_library_wrappers");
const panel_utils_1 = require("../../../common/panel_utils");
const common_1 = require("../../../utils/common");
const line_1 = require("../renderer/canvas/primitives/line");
exports.HIERARCHICAL_GRID_WIDTH = 1;
exports.OUTSIDE_RANGE_TOLERANCE = 0.01;
exports.HIDE_MINOR_TIME_GRID = false;
function getGridLines(axesSpecs, axesGeoms, { axes: themeAxisStyle }, scales) {
    const panelSize = (0, panel_utils_1.getPanelSize)(scales);
    return (0, panel_utils_1.getPerPanelMap)(scales, () => {
        const lines = axesGeoms.reduce((linesAcc, { axis, visibleTicks }) => {
            const axisSpec = axesSpecs.find(({ id }) => id === axis.id);
            if (!axisSpec) {
                return linesAcc;
            }
            const linesForSpec = getGridLinesForAxis(axisSpec, visibleTicks, themeAxisStyle, panelSize);
            return linesForSpec.length === 0 ? linesAcc : [...linesAcc, ...linesForSpec];
        }, []);
        return { lineGroups: lines };
    });
}
exports.getGridLines = getGridLines;
function getGridLinesForAxis(axisSpec, visibleTicks, themeAxisStyle, panelSize) {
    const isVertical = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position);
    const axisStyle = (0, common_1.mergePartial)(themeAxisStyle, axisSpec.style);
    const gridLineThemeStyle = isVertical ? axisStyle.gridLine.vertical : axisStyle.gridLine.horizontal;
    const gridLineStyles = axisSpec.gridLine ? (0, common_1.mergePartial)(gridLineThemeStyle, axisSpec.gridLine) : gridLineThemeStyle;
    if (!gridLineStyles.visible) {
        return [];
    }
    if (!gridLineStyles.stroke || !gridLineStyles.strokeWidth || gridLineStyles.strokeWidth < line_1.MIN_STROKE_WIDTH) {
        return [];
    }
    const visibleTicksPerLayer = visibleTicks.reduce((acc, tick) => {
        if (Math.abs(tick.position - tick.domainClampedPosition) > exports.OUTSIDE_RANGE_TOLERANCE)
            return acc;
        if (typeof tick.layer === 'number' && !tick.showGrid)
            return acc;
        if (exports.HIDE_MINOR_TIME_GRID && typeof tick.layer === 'number' && tick.detailedLayer === 0)
            return acc;
        const ticks = acc.get(tick.detailedLayer);
        if (ticks) {
            ticks.push(tick);
        }
        else {
            acc.set(tick.detailedLayer, [tick]);
        }
        return acc;
    }, new Map());
    return [...visibleTicksPerLayer]
        .sort(([k1], [k2]) => (k1 !== null && k1 !== void 0 ? k1 : 0) - (k2 !== null && k2 !== void 0 ? k2 : 0))
        .map(([detailedLayer, visibleTicksOfLayer]) => {
        var _a, _b;
        const lines = visibleTicksOfLayer.map((tick) => isVertical
            ? getGridLineForVerticalAxisAt(tick.position, panelSize)
            : getGridLineForHorizontalAxisAt(tick.position, panelSize));
        const strokeColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(gridLineStyles.stroke), (strokeColorOpacity) => gridLineStyles.opacity !== undefined ? strokeColorOpacity * gridLineStyles.opacity : strokeColorOpacity);
        const layered = typeof ((_a = visibleTicksOfLayer[0]) === null || _a === void 0 ? void 0 : _a.layer) === 'number';
        const multilayerLuma = (_b = themeAxisStyle.gridLine.lumaSteps[detailedLayer]) !== null && _b !== void 0 ? _b : NaN;
        const stroke = {
            color: layered ? [multilayerLuma, multilayerLuma, multilayerLuma, 1] : strokeColor,
            width: layered ? exports.HIERARCHICAL_GRID_WIDTH : gridLineStyles.strokeWidth,
            dash: gridLineStyles.dash,
        };
        return { lines, stroke, axisId: axisSpec.id };
    });
}
function getGridLineForVerticalAxisAt(tickPosition, panelSize) {
    return { x1: 0, y1: tickPosition, x2: panelSize.width, y2: tickPosition };
}
exports.getGridLineForVerticalAxisAt = getGridLineForVerticalAxisAt;
function getGridLineForHorizontalAxisAt(tickPosition, panelSize) {
    return { x1: tickPosition, y1: 0, x2: tickPosition, y2: panelSize.height };
}
exports.getGridLineForHorizontalAxisAt = getGridLineForHorizontalAxisAt;
//# sourceMappingURL=grid_lines.js.map