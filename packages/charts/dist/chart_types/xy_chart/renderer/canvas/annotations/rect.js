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
exports.renderRectAnnotations = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var rect_1 = require("../primitives/rect");
var panel_transform_1 = require("../utils/panel_transform");
function renderRectAnnotations(ctx, aCtx, annotations, rectStyle, getHoverParams, rotation, renderingArea) {
    var getFillAndStroke = function (id) {
        var _a = getHoverParams(id), style = _a.style, options = _a.options;
        var opacityKey = "anno-rect-opacity--".concat(id);
        var hoverOpacity = aCtx.getValue(options)(opacityKey, style.opacity);
        var fill = {
            color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(rectStyle.fill), function (opacity) { return opacity * rectStyle.opacity * hoverOpacity; }),
        };
        var stroke = {
            color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(rectStyle.stroke), function (opacity) { return opacity * rectStyle.opacity * hoverOpacity; }),
            width: rectStyle.strokeWidth,
        };
        return [fill, stroke];
    };
    annotations.forEach(function (_a) {
        var rect = _a.rect, panel = _a.panel, id = _a.id;
        return (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () { return rect_1.renderRect.apply(void 0, __spreadArray([ctx, rect], __read(getFillAndStroke(id)), false)); });
    });
}
exports.renderRectAnnotations = renderRectAnnotations;
//# sourceMappingURL=rect.js.map