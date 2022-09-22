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
exports.renderTickLabel = void 0;
var common_1 = require("../../../../../utils/common");
var axis_utils_1 = require("../../../utils/axis_utils");
var text_1 = require("../primitives/text");
var debug_1 = require("../utils/debug");
var TICK_TO_LABEL_GAP = 2;
function renderTickLabel(ctx, tick, showTicks, _a, layerGirth) {
    var _b;
    var _c = _a.axisSpec, position = _c.position, timeAxisLayerCount = _c.timeAxisLayerCount, dimension = _a.dimension, size = _a.size, debug = _a.debug, axisStyle = _a.axisStyle;
    var labelStyle = axisStyle.tickLabel;
    var tickLabelProps = (0, axis_utils_1.getTickLabelPosition)(axisStyle, tick.domainClampedPosition, position, labelStyle.rotation, size, dimension, showTicks, labelStyle.offset, labelStyle.alignment);
    var center = { x: tickLabelProps.x + tickLabelProps.offsetX, y: tickLabelProps.y + tickLabelProps.offsetY };
    if (debug) {
        var maxLabelBboxWidth = dimension.maxLabelBboxWidth, maxLabelBboxHeight = dimension.maxLabelBboxHeight, width = dimension.maxLabelTextWidth, height = dimension.maxLabelTextHeight;
        (0, debug_1.renderDebugRectCenterRotated)(ctx, center, __assign(__assign({}, center), { width: width, height: height }), undefined, undefined, labelStyle.rotation);
        if (labelStyle.rotation % 90 !== 0) {
            (0, debug_1.renderDebugRectCenterRotated)(ctx, center, __assign(__assign({}, center), { width: maxLabelBboxWidth, height: maxLabelBboxHeight }));
        }
    }
    var tickOnTheSide = timeAxisLayerCount > 0 && Number.isFinite(tick.layer);
    (0, text_1.renderText)(ctx, center, tick.label, {
        fontFamily: labelStyle.fontFamily,
        fontStyle: (_b = labelStyle.fontStyle) !== null && _b !== void 0 ? _b : 'normal',
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