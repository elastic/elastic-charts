"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextureStyles = void 0;
const common_1 = require("../../../utils/common");
const theme_1 = require("../../../utils/themes/theme");
const shapes_paths_1 = require("../renderer/shapes_paths");
const getSpacing = ({ spacing }) => {
    var _a, _b;
    return ({
        x: typeof spacing === 'number' ? spacing : (_a = spacing === null || spacing === void 0 ? void 0 : spacing.x) !== null && _a !== void 0 ? _a : 0,
        y: typeof spacing === 'number' ? spacing : (_b = spacing === null || spacing === void 0 ? void 0 : spacing.y) !== null && _b !== void 0 ? _b : 0,
    });
};
const getPath = (textureStyle, size, strokeWidth) => {
    if ('path' in textureStyle) {
        const path = typeof textureStyle.path === 'string' ? new Path2D(textureStyle.path) : textureStyle.path;
        return [path, 0];
    }
    const [pathFn, rotation] = shapes_paths_1.TextureRendererFn[textureStyle.shape];
    const strokeWidthPadding = [theme_1.TextureShape.Circle, theme_1.TextureShape.Square].includes(textureStyle.shape)
        ? strokeWidth
        : 0;
    return [new Path2D(pathFn((size - strokeWidthPadding) / 2)), rotation];
};
function createPattern(ctx, dpi, patternCanvas, baseColor, sharedGeometryOpacity, textureStyle) {
    var _a, _b, _c, _d;
    const pCtx = patternCanvas.getContext('2d');
    if (!textureStyle || !pCtx)
        return null;
    const { size = 10, stroke, strokeWidth = 1, opacity, shapeRotation, fill, dash } = textureStyle;
    const spacing = getSpacing(textureStyle);
    const cssWidth = size + spacing.x;
    const cssHeight = size + spacing.y;
    patternCanvas.width = dpi * cssWidth;
    patternCanvas.height = dpi * cssHeight;
    pCtx.globalAlpha = sharedGeometryOpacity * (opacity !== null && opacity !== void 0 ? opacity : 1);
    pCtx.lineWidth = strokeWidth;
    pCtx.strokeStyle = (0, common_1.getColorFromVariant)(baseColor, stroke !== null && stroke !== void 0 ? stroke : common_1.ColorVariant.Series);
    if (dash)
        pCtx.setLineDash(dash);
    if (fill)
        pCtx.fillStyle = (0, common_1.getColorFromVariant)(baseColor, fill);
    const [path, pathRotation] = getPath(textureStyle, size, strokeWidth);
    const itemRotation = (shapeRotation !== null && shapeRotation !== void 0 ? shapeRotation : 0) + pathRotation;
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
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    const { offset, rotation } = textureStyle;
    const matrix = new DOMMatrix([1 / dpi, 0, 0, 1 / dpi, 0, 0]);
    if (offset === null || offset === void 0 ? void 0 : offset.global)
        matrix.translateSelf((_a = offset.x) !== null && _a !== void 0 ? _a : 0, (_b = offset.y) !== null && _b !== void 0 ? _b : 0);
    matrix.rotateSelf(rotation !== null && rotation !== void 0 ? rotation : 0);
    if (offset && !offset.global)
        matrix.translateSelf((_c = offset.x) !== null && _c !== void 0 ? _c : 0, (_d = offset.y) !== null && _d !== void 0 ? _d : 0);
    pattern.setTransform(matrix);
    return pattern;
}
const getTextureStyles = (ctx, patternCanvas, baseColor, sharedGeometryOpacity, texture) => {
    const dpi = window.devicePixelRatio;
    const pattern = createPattern(ctx, dpi, patternCanvas, baseColor, sharedGeometryOpacity, texture);
    if (!pattern || !texture)
        return;
    const { rotation, offset } = texture;
    return {
        pattern,
        rotation,
        offset,
    };
};
exports.getTextureStyles = getTextureStyles;
//# sourceMappingURL=texture.js.map