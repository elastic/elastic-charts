"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTick = void 0;
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const common_1 = require("../../../../../utils/common");
const axis_type_utils_1 = require("../../../utils/axis_type_utils");
const grid_lines_1 = require("../../../utils/grid_lines");
const line_1 = require("../primitives/line");
const BASELINE_CORRECTION = 2;
function renderTick(ctx, { position, domainClampedPosition: tickPosition, layer, detailedLayer }, { axisSpec: { position: axisPosition, timeAxisLayerCount }, size: { width, height }, axisStyle: { tickLine, gridLine }, layerGirth, }) {
    var _a;
    if (Math.abs(tickPosition - position) > grid_lines_1.OUTSIDE_RANGE_TOLERANCE)
        return;
    const tickOnTheSide = timeAxisLayerCount > 0 && typeof layer === 'number';
    const extensionLayer = tickOnTheSide ? layer + 1 : 0;
    const tickSize = tickLine.size +
        (tickOnTheSide && (detailedLayer > 0 || !grid_lines_1.HIDE_MINOR_TIME_GRID)
            ? extensionLayer * layerGirth + (extensionLayer < 1 ? 0 : tickLine.padding - BASELINE_CORRECTION)
            : 0);
    const xy = (0, axis_type_utils_1.isHorizontalAxis)(axisPosition)
        ? {
            x1: tickPosition,
            x2: tickPosition,
            ...(axisPosition === common_1.Position.Top ? { y1: height - tickSize, y2: height } : { y1: 0, y2: tickSize }),
        }
        : {
            y1: tickPosition,
            y2: tickPosition,
            ...(axisPosition === common_1.Position.Left ? { x1: width, x2: width - tickSize } : { x1: 0, x2: tickSize }),
        };
    const layered = typeof layer === 'number';
    const multilayerLuma = (_a = gridLine.lumaSteps[detailedLayer]) !== null && _a !== void 0 ? _a : NaN;
    const strokeWidth = layered ? grid_lines_1.HIERARCHICAL_GRID_WIDTH : tickLine.strokeWidth;
    const color = layered ? [multilayerLuma, multilayerLuma, multilayerLuma, 1] : (0, color_library_wrappers_1.colorToRgba)(tickLine.stroke);
    (0, line_1.renderMultiLine)(ctx, [xy], { color, width: strokeWidth });
}
exports.renderTick = renderTick;
//# sourceMappingURL=tick.js.map