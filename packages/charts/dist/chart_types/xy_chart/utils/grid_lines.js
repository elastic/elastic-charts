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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGridLineForHorizontalAxisAt = exports.getGridLineForVerticalAxisAt = exports.getGridLines = exports.HIDE_MINOR_TIME_GRID = exports.OUTSIDE_RANGE_TOLERANCE = exports.HIERARCHICAL_GRID_WIDTH = void 0;
var color_library_wrappers_1 = require("../../../common/color_library_wrappers");
var common_1 = require("../../../utils/common");
var line_1 = require("../renderer/canvas/primitives/line");
var axis_type_utils_1 = require("./axis_type_utils");
var panel_1 = require("./panel");
var panel_utils_1 = require("./panel_utils");
exports.HIERARCHICAL_GRID_WIDTH = 1;
exports.OUTSIDE_RANGE_TOLERANCE = 0.01;
exports.HIDE_MINOR_TIME_GRID = false;
function getGridLines(axesSpecs, axesGeoms, _a, scales) {
    var themeAxisStyle = _a.axes;
    var panelSize = (0, panel_1.getPanelSize)(scales);
    return (0, panel_utils_1.getPerPanelMap)(scales, function () {
        var lines = axesGeoms.reduce(function (linesAcc, _a) {
            var axis = _a.axis, visibleTicks = _a.visibleTicks;
            var axisSpec = axesSpecs.find(function (_a) {
                var id = _a.id;
                return id === axis.id;
            });
            if (!axisSpec) {
                return linesAcc;
            }
            var linesForSpec = getGridLinesForAxis(axisSpec, visibleTicks, themeAxisStyle, panelSize);
            return linesForSpec.length === 0 ? linesAcc : __spreadArray(__spreadArray([], __read(linesAcc), false), __read(linesForSpec), false);
        }, []);
        return { lineGroups: lines };
    });
}
exports.getGridLines = getGridLines;
function getGridLinesForAxis(axisSpec, visibleTicks, themeAxisStyle, panelSize) {
    var _a;
    var isVertical = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position);
    var axisStyle = (0, common_1.mergePartial)(themeAxisStyle, axisSpec.style);
    var gridLineThemeStyle = isVertical ? axisStyle.gridLine.vertical : axisStyle.gridLine.horizontal;
    var gridLineStyles = axisSpec.gridLine ? (0, common_1.mergePartial)(gridLineThemeStyle, axisSpec.gridLine) : gridLineThemeStyle;
    var showGridLines = (_a = axisSpec.showGridLines) !== null && _a !== void 0 ? _a : gridLineStyles.visible;
    if (!showGridLines) {
        return [];
    }
    if (!gridLineStyles.stroke || !gridLineStyles.strokeWidth || gridLineStyles.strokeWidth < line_1.MIN_STROKE_WIDTH) {
        return [];
    }
    var visibleTicksPerLayer = visibleTicks.reduce(function (acc, tick) {
        if (Math.abs(tick.position - tick.domainClampedPosition) > exports.OUTSIDE_RANGE_TOLERANCE)
            return acc;
        if (typeof tick.layer === 'number' && !tick.showGrid)
            return acc;
        if (exports.HIDE_MINOR_TIME_GRID && typeof tick.layer === 'number' && tick.detailedLayer === 0)
            return acc;
        var ticks = acc.get(tick.detailedLayer);
        if (ticks) {
            ticks.push(tick);
        }
        else {
            acc.set(tick.detailedLayer, [tick]);
        }
        return acc;
    }, new Map());
    return __spreadArray([], __read(visibleTicksPerLayer), false).sort(function (_a, _b) {
        var _c = __read(_a, 1), k1 = _c[0];
        var _d = __read(_b, 1), k2 = _d[0];
        return (k1 !== null && k1 !== void 0 ? k1 : 0) - (k2 !== null && k2 !== void 0 ? k2 : 0);
    })
        .map(function (_a) {
        var _b = __read(_a, 2), detailedLayer = _b[0], visibleTicksOfLayer = _b[1];
        var lines = visibleTicksOfLayer.map(function (tick) {
            return isVertical
                ? getGridLineForVerticalAxisAt(tick.position, panelSize)
                : getGridLineForHorizontalAxisAt(tick.position, panelSize);
        });
        var strokeColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(gridLineStyles.stroke), function (strokeColorOpacity) {
            return gridLineStyles.opacity !== undefined ? strokeColorOpacity * gridLineStyles.opacity : strokeColorOpacity;
        });
        var layered = typeof visibleTicksOfLayer[0].layer === 'number';
        var multilayerLuma = themeAxisStyle.gridLine.lumaSteps[detailedLayer];
        var stroke = {
            color: layered ? [multilayerLuma, multilayerLuma, multilayerLuma, 1] : strokeColor,
            width: layered ? exports.HIERARCHICAL_GRID_WIDTH : gridLineStyles.strokeWidth,
            dash: gridLineStyles.dash,
        };
        return { lines: lines, stroke: stroke, axisId: axisSpec.id };
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