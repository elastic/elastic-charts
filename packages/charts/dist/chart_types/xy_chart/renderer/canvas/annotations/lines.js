"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLineAnnotations = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var line_1 = require("../primitives/line");
var panel_transform_1 = require("../utils/panel_transform");
function renderLineAnnotations(ctx, aCtx, annotations, lineStyle, getHoverParams, rotation, renderingArea) {
    var getStroke = function (id) {
        var _a = getHoverParams(id), style = _a.style, options = _a.options;
        var opacityKey = "anno-rect-opacity--".concat(id);
        var hoverOpacity = aCtx.getValue(options)(opacityKey, style.opacity);
        var strokeColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(lineStyle.line.stroke), function (opacity) { return opacity * lineStyle.line.opacity * hoverOpacity; });
        return {
            color: strokeColor,
            width: lineStyle.line.strokeWidth,
            dash: lineStyle.line.dash,
        };
    };
    annotations.forEach(function (_a) {
        var linePathPoints = _a.linePathPoints, panel = _a.panel, id = _a.id;
        return (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () {
            return (0, line_1.renderMultiLine)(ctx, [linePathPoints], getStroke(id));
        });
    });
}
exports.renderLineAnnotations = renderLineAnnotations;
//# sourceMappingURL=lines.js.map