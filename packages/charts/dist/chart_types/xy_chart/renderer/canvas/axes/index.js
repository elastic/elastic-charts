"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAxis = void 0;
var axis_utils_1 = require("../../../utils/axis_utils");
var line_1 = require("./line");
var tick_1 = require("./tick");
var tick_label_1 = require("./tick_label");
function renderAxis(ctx, props) {
    var ticks = props.ticks, axisStyle = props.axisStyle, axisSpec = props.axisSpec, secondary = props.secondary, layerGirth = props.layerGirth;
    var showTicks = (0, axis_utils_1.shouldShowTicks)(axisStyle.tickLine, axisSpec.hide);
    (0, line_1.renderAxisLine)(ctx, props);
    if (!secondary && showTicks)
        ticks.forEach(function (tick) { return (0, tick_1.renderTick)(ctx, tick, props); });
    if (!secondary && axisStyle.tickLabel.visible)
        ticks.forEach(function (tick) { return (0, tick_label_1.renderTickLabel)(ctx, tick, showTicks, props, layerGirth !== null && layerGirth !== void 0 ? layerGirth : 0); });
}
exports.renderAxis = renderAxis;
//# sourceMappingURL=index.js.map