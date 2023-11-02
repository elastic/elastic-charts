"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureRendererFn = exports.ShapeRendererFn = void 0;
const common_1 = require("../../../utils/common");
const theme_1 = require("../../../utils/themes/theme");
const cross = (r) => {
    return `M ${-r} 0 L ${r} 0 M 0 ${r} L 0 ${-r}`;
};
const triangle = (r) => {
    const h = (r * Math.sqrt(3)) / 2;
    const hr = r / 2;
    return `M ${-h} ${hr} L ${h} ${hr} L 0 ${-r} Z`;
};
const square = (rotation = 0) => (r) => {
    const d = (0, common_1.degToRad)(rotation);
    const s = Math.abs(Math.cos(d) + Math.sin(d));
    const sr = s > 0 ? r / s : r;
    return `M ${-sr} ${-sr} L ${-sr} ${sr} L ${sr} ${sr} L ${sr} ${-sr} Z`;
};
const circle = (r) => {
    return `M ${-r} 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`;
};
const line = (r) => {
    return `M 0 ${-r} l 0 ${r * 2}`;
};
exports.ShapeRendererFn = {
    [theme_1.PointShape.Circle]: [circle, 0],
    [theme_1.PointShape.X]: [cross, 45],
    [theme_1.PointShape.Plus]: [cross, 0],
    [theme_1.PointShape.Diamond]: [square(45), 45],
    [theme_1.PointShape.Square]: [square(0), 0],
    [theme_1.PointShape.Triangle]: [triangle, 0],
};
exports.TextureRendererFn = {
    ...exports.ShapeRendererFn,
    [theme_1.TextureShape.Line]: [line, 0],
};
//# sourceMappingURL=shapes_paths.js.map