"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTickLabel = void 0;
const common_1 = require("../../../../../utils/common");
const axis_utils_1 = require("../../../utils/axis_utils");
const text_1 = require("../primitives/text");
const debug_1 = require("../utils/debug");
const TICK_TO_LABEL_GAP = 2;
function renderTickLabel(ctx, tick, showTicks, { axisSpec: { position, timeAxisLayerCount }, dimension, size, debug, axisStyle }, layerGirth) {
    var _a;
    const labelStyle = axisStyle.tickLabel;
    const tickLabelProps = (0, axis_utils_1.getTickLabelPosition)(axisStyle, tick.domainClampedPosition, position, labelStyle.rotation, size, dimension, showTicks, labelStyle.offset, labelStyle.alignment);
    const center = { x: tickLabelProps.x + tickLabelProps.offsetX, y: tickLabelProps.y + tickLabelProps.offsetY };
    if (debug) {
        const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth: width, maxLabelTextHeight: height } = dimension;
        (0, debug_1.renderDebugRectCenterRotated)(ctx, center, { ...center, width, height }, undefined, undefined, labelStyle.rotation);
        if (labelStyle.rotation % 90 !== 0) {
            (0, debug_1.renderDebugRectCenterRotated)(ctx, center, { ...center, width: maxLabelBboxWidth, height: maxLabelBboxHeight });
        }
    }
    const tickOnTheSide = timeAxisLayerCount > 0 && Number.isFinite(tick.layer);
    (0, text_1.renderText)(ctx, center, tick.label, {
        fontFamily: labelStyle.fontFamily,
        fontStyle: (_a = labelStyle.fontStyle) !== null && _a !== void 0 ? _a : 'normal',
        fontVariant: 'normal',
        fontWeight: 'normal',
        textColor: labelStyle.fill,
        fontSize: labelStyle.fontSize,
        align: tickLabelProps.horizontalAlign,
        baseline: tickLabelProps.verticalAlign,
    }, labelStyle.rotation, tickLabelProps.textOffsetX + (tickOnTheSide ? TICK_TO_LABEL_GAP : 0), tickLabelProps.textOffsetY + (tick.layer || 0) * layerGirth * (position === common_1.Position.Top ? -1 : 1), 1, tick.direction);
}
exports.renderTickLabel = renderTickLabel;
//# sourceMappingURL=tick_label.js.map