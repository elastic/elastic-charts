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
exports.renderPointGroup = exports.renderPoints = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var panel_clipping_1 = require("./panel_clipping");
var shapes_1 = require("./primitives/shapes");
var panel_transform_1 = require("./utils/panel_transform");
function renderPoints(ctx, points, _a) {
    var opacity = _a.opacity;
    points
        .slice()
        .sort(function (_a, _b) {
        var a = _a.radius;
        var b = _b.radius;
        return b - a;
    })
        .forEach(function (_a) {
        var x = _a.x, y = _a.y, radius = _a.radius, transform = _a.transform, style = _a.style;
        var coordinates = { x: x + transform.x, y: y + transform.y, radius: radius };
        var fill = { color: (0, color_library_wrappers_1.overrideOpacity)(style.fill.color, function (fillOpacity) { return fillOpacity * opacity; }) };
        var stroke = __assign(__assign({}, style.stroke), { color: (0, color_library_wrappers_1.overrideOpacity)(style.stroke.color, function (fillOpacity) { return fillOpacity * opacity; }) });
        (0, shapes_1.renderShape)(ctx, style.shape, coordinates, fill, stroke);
    });
}
exports.renderPoints = renderPoints;
function renderPointGroup(ctx, points, geometryStateStyles, rotation, renderingArea, shouldClip) {
    points
        .slice()
        .sort(function (_a, _b) {
        var a = _a.radius;
        var b = _b.radius;
        return b - a;
    })
        .forEach(function (_a) {
        var x = _a.x, y = _a.y, radius = _a.radius, transform = _a.transform, style = _a.style, key = _a.seriesIdentifier.key, panel = _a.panel;
        var opacity = geometryStateStyles[key].opacity;
        var fill = { color: (0, color_library_wrappers_1.overrideOpacity)(style.fill.color, function (fillOpacity) { return fillOpacity * opacity; }) };
        var stroke = __assign(__assign({}, style.stroke), { color: (0, color_library_wrappers_1.overrideOpacity)(style.stroke.color, function (fillOpacity) { return fillOpacity * opacity; }) });
        var coordinates = { x: x + transform.x, y: y, radius: radius };
        var renderer = function () { return (0, shapes_1.renderShape)(ctx, style.shape, coordinates, fill, stroke); };
        var clippings = { area: (0, panel_clipping_1.getPanelClipping)(panel, rotation), shouldClip: shouldClip };
        (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, renderer, clippings);
    });
}
exports.renderPointGroup = renderPointGroup;
//# sourceMappingURL=points.js.map