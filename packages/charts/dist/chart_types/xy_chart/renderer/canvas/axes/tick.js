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
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTick = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var common_1 = require("../../../../../utils/common");
var axis_type_utils_1 = require("../../../utils/axis_type_utils");
var grid_lines_1 = require("../../../utils/grid_lines");
var line_1 = require("../primitives/line");
var BASELINE_CORRECTION = 2;
function renderTick(ctx, _a, _b) {
    var position = _a.position, tickPosition = _a.domainClampedPosition, layer = _a.layer, detailedLayer = _a.detailedLayer;
    var _c = _b.axisSpec, axisPosition = _c.position, timeAxisLayerCount = _c.timeAxisLayerCount, _d = _b.size, width = _d.width, height = _d.height, _e = _b.axisStyle, tickLine = _e.tickLine, gridLine = _e.gridLine, layerGirth = _b.layerGirth;
    if (Math.abs(tickPosition - position) > grid_lines_1.OUTSIDE_RANGE_TOLERANCE)
        return;
    var tickOnTheSide = timeAxisLayerCount > 0 && typeof layer === 'number';
    var extensionLayer = tickOnTheSide ? layer + 1 : 0;
    var tickSize = tickLine.size +
        (tickOnTheSide && (detailedLayer > 0 || !grid_lines_1.HIDE_MINOR_TIME_GRID)
            ? extensionLayer * layerGirth + (extensionLayer < 1 ? 0 : tickLine.padding - BASELINE_CORRECTION)
            : 0);
    var xy = (0, axis_type_utils_1.isHorizontalAxis)(axisPosition)
        ? __assign({ x1: tickPosition, x2: tickPosition }, (axisPosition === common_1.Position.Top ? { y1: height - tickSize, y2: height } : { y1: 0, y2: tickSize })) : __assign({ y1: tickPosition, y2: tickPosition }, (axisPosition === common_1.Position.Left ? { x1: width, x2: width - tickSize } : { x1: 0, x2: tickSize }));
    var layered = typeof layer === 'number';
    var multilayerLuma = gridLine.lumaSteps[detailedLayer];
    var strokeWidth = layered ? grid_lines_1.HIERARCHICAL_GRID_WIDTH : tickLine.strokeWidth;
    var color = layered ? [multilayerLuma, multilayerLuma, multilayerLuma, 1] : (0, color_library_wrappers_1.colorToRgba)(tickLine.stroke);
    (0, line_1.renderMultiLine)(ctx, [xy], { color: color, width: strokeWidth });
}
exports.renderTick = renderTick;
//# sourceMappingURL=tick.js.map