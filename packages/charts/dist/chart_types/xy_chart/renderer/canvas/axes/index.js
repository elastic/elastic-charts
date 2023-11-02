"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAxis = void 0;
const line_1 = require("./line");
const tick_1 = require("./tick");
const tick_label_1 = require("./tick_label");
const axis_utils_1 = require("../../../utils/axis_utils");
function renderAxis(ctx, props) {
    const { ticks, axisStyle, axisSpec, secondary, layerGirth } = props;
    const showTicks = (0, axis_utils_1.shouldShowTicks)(axisStyle.tickLine, axisSpec.hide);
    (0, line_1.renderAxisLine)(ctx, props);
    if (!secondary && showTicks)
        ticks.forEach((tick) => (0, tick_1.renderTick)(ctx, tick, props));
    if (!secondary && axisStyle.tickLabel.visible)
        ticks.forEach((tick) => (0, tick_label_1.renderTickLabel)(ctx, tick, showTicks, props, layerGirth !== null && layerGirth !== void 0 ? layerGirth : 0));
}
exports.renderAxis = renderAxis;
//# sourceMappingURL=index.js.map