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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextureStyles = void 0;
var common_1 = require("../../../utils/common");
var theme_1 = require("../../../utils/themes/theme");
var shapes_paths_1 = require("../renderer/shapes_paths");
var getSpacing = function (_a) {
    var _b, _c;
    var spacing = _a.spacing;
    return ({
        x: typeof spacing === 'number' ? spacing : (_b = spacing === null || spacing === void 0 ? void 0 : spacing.x) !== null && _b !== void 0 ? _b : 0,
        y: typeof spacing === 'number' ? spacing : (_c = spacing === null || spacing === void 0 ? void 0 : spacing.y) !== null && _c !== void 0 ? _c : 0,
    });
};
var getPath = function (textureStyle, size, strokeWidth) {
    if ('path' in textureStyle) {
        var path = typeof textureStyle.path === 'string' ? new Path2D(textureStyle.path) : textureStyle.path;
        return [path, 0];
    }
    var _a = __read(shapes_paths_1.TextureRendererFn[textureStyle.shape], 2), pathFn = _a[0], rotation = _a[1];
    var strokeWidthPadding = [theme_1.TextureShape.Circle, theme_1.TextureShape.Square].includes(textureStyle.shape)
        ? strokeWidth
        : 0;
    return [new Path2D(pathFn((size - strokeWidthPadding) / 2)), rotation];
};
function createPattern(ctx, dpi, patternCanvas, baseColor, sharedGeometryOpacity, textureStyle) {
    var _a, _b, _c, _d;
    var pCtx = patternCanvas.getContext('2d');
    if (!textureStyle || !pCtx)
        return null;
    var _e = textureStyle.size, size = _e === void 0 ? 10 : _e, stroke = textureStyle.stroke, _f = textureStyle.strokeWidth, strokeWidth = _f === void 0 ? 1 : _f, opacity = textureStyle.opacity, shapeRotation = textureStyle.shapeRotation, fill = textureStyle.fill, dash = textureStyle.dash;
    var spacing = getSpacing(textureStyle);
    var cssWidth = size + spacing.x;
    var cssHeight = size + spacing.y;
    patternCanvas.width = dpi * cssWidth;
    patternCanvas.height = dpi * cssHeight;
    pCtx.globalAlpha = sharedGeometryOpacity * (opacity !== null && opacity !== void 0 ? opacity : 1);
    pCtx.lineWidth = strokeWidth;
    pCtx.strokeStyle = (0, common_1.getColorFromVariant)(baseColor, stroke !== null && stroke !== void 0 ? stroke : common_1.ColorVariant.Series);
    if (dash)
        pCtx.setLineDash(dash);
    if (fill)
        pCtx.fillStyle = (0, common_1.getColorFromVariant)(baseColor, fill);
    var _g = __read(getPath(textureStyle, size, strokeWidth), 2), path = _g[0], pathRotation = _g[1];
    var itemRotation = (shapeRotation !== null && shapeRotation !== void 0 ? shapeRotation : 0) + pathRotation;
    pCtx.scale(dpi, dpi);
    pCtx.translate(cssWidth / 2, cssHeight / 2);
    if (itemRotation)
        pCtx.rotate((0, common_1.degToRad)(itemRotation));
    pCtx.beginPath();
    if (path) {
        pCtx.stroke(path);
        if (fill)
            pCtx.fill(path);
    }
    var pattern = ctx.createPattern(patternCanvas, 'repeat');
    var offset = textureStyle.offset, rotation = textureStyle.rotation;
    var matrix = new DOMMatrix([1 / dpi, 0, 0, 1 / dpi, 0, 0]);
    if (offset === null || offset === void 0 ? void 0 : offset.global)
        matrix.translateSelf((_a = offset.x) !== null && _a !== void 0 ? _a : 0, (_b = offset.y) !== null && _b !== void 0 ? _b : 0);
    matrix.rotateSelf(rotation !== null && rotation !== void 0 ? rotation : 0);
    if (offset && !offset.global)
        matrix.translateSelf((_c = offset.x) !== null && _c !== void 0 ? _c : 0, (_d = offset.y) !== null && _d !== void 0 ? _d : 0);
    pattern.setTransform(matrix);
    return pattern;
}
var getTextureStyles = function (ctx, patternCanvas, baseColor, sharedGeometryOpacity, texture) {
    var dpi = window.devicePixelRatio;
    var pattern = createPattern(ctx, dpi, patternCanvas, baseColor, sharedGeometryOpacity, texture);
    if (!pattern || !texture)
        return;
    var rotation = texture.rotation, offset = texture.offset;
    return {
        pattern: pattern,
        rotation: rotation,
        offset: offset,
    };
};
exports.getTextureStyles = getTextureStyles;
//# sourceMappingURL=texture.js.map