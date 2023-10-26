"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPointGroup = exports.renderPoints = void 0;
const panel_clipping_1 = require("./panel_clipping");
const shapes_1 = require("./primitives/shapes");
const panel_transform_1 = require("./utils/panel_transform");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
function renderPoints(ctx, points, { opacity }) {
    points
        .slice()
        .sort(({ radius: a }, { radius: b }) => b - a)
        .forEach(({ x, y, radius, transform, style }) => {
        const coordinates = { x: x + transform.x, y: y + transform.y, radius };
        const fill = { color: (0, color_library_wrappers_1.overrideOpacity)(style.fill.color, (fillOpacity) => fillOpacity * opacity) };
        const stroke = {
            ...style.stroke,
            color: (0, color_library_wrappers_1.overrideOpacity)(style.stroke.color, (fillOpacity) => fillOpacity * opacity),
        };
        (0, shapes_1.renderShape)(ctx, style.shape, coordinates, fill, stroke);
    });
}
exports.renderPoints = renderPoints;
function renderPointGroup(ctx, points, geometryStateStyles, rotation, renderingArea, shouldClip) {
    points
        .slice()
        .sort(({ radius: a }, { radius: b }) => b - a)
        .forEach(({ x, y, radius, transform, style, seriesIdentifier: { key }, panel }) => {
        var _a, _b;
        const opacity = (_b = (_a = geometryStateStyles[key]) === null || _a === void 0 ? void 0 : _a.opacity) !== null && _b !== void 0 ? _b : 1;
        const fill = { color: (0, color_library_wrappers_1.overrideOpacity)(style.fill.color, (fillOpacity) => fillOpacity * opacity) };
        const stroke = {
            ...style.stroke,
            color: (0, color_library_wrappers_1.overrideOpacity)(style.stroke.color, (fillOpacity) => fillOpacity * opacity),
        };
        const coordinates = { x: x + transform.x, y, radius };
        const renderer = () => (0, shapes_1.renderShape)(ctx, style.shape, coordinates, fill, stroke);
        const clippings = { area: (0, panel_clipping_1.getPanelClipping)(panel, rotation), shouldClip };
        (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, renderer, clippings);
    });
}
exports.renderPointGroup = renderPointGroup;
//# sourceMappingURL=points.js.map