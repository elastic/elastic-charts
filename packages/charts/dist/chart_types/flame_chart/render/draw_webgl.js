"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawWebgl = void 0;
const common_1 = require("./common");
const shaders_1 = require("../shaders");
const MAX_PADDING_RATIO = 0.25;
const MIN_FILL_RATIO = [1 - MAX_PADDING_RATIO, 0.6];
const CORNER_RADIUS_RATIO = 0.25;
const VERTICES_PER_GEOM = 4;
const DUMMY_INDEX = -1;
const drawWebgl = (gl, nodeTweenTime, canvasWidth, canvasHeight, xOffset, yOffset, pickTexture, renderer, hoverIndex, rowHeight, f, instanceCount, focusLayer, pickLayer, wobbleIndex, wobble) => renderer({
    target: pickLayer ? pickTexture.target() : null,
    uniformValues: {
        pickLayer,
        nodeTweenTime: Math.max(0.001, nodeTweenTime),
        resolution: [canvasWidth, canvasHeight],
        gapPx: pickLayer || !focusLayer ? [0, 0] : [common_1.BOX_GAP_HORIZONTAL, common_1.BOX_GAP_VERTICAL],
        minFillRatio: MIN_FILL_RATIO,
        cornerRadiusPx: pickLayer ? 0 : canvasHeight * rowHeight * CORNER_RADIUS_RATIO,
        hoverIndex: Number.isFinite(hoverIndex) ? hoverIndex + shaders_1.GEOM_INDEX_OFFSET : DUMMY_INDEX,
        wobbleIndex: Number.isFinite(wobbleIndex) ? wobbleIndex + shaders_1.GEOM_INDEX_OFFSET : DUMMY_INDEX,
        wobble,
        rowHeight0: rowHeight,
        rowHeight1: rowHeight,
        focus: [f[0], f[1], 0, 0, f[2], f[3], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    viewport: { x: xOffset, y: yOffset, width: canvasWidth, height: canvasHeight },
    clear: {
        color: [0, 0, 0, focusLayer || pickLayer ? 0 : 0.03],
        rect: [xOffset, yOffset, canvasWidth, canvasHeight],
    },
    draw: pickLayer && !focusLayer
        ? undefined
        : {
            geom: gl.TRIANGLE_STRIP,
            offset: 0,
            count: VERTICES_PER_GEOM,
            instanceCount,
        },
});
exports.drawWebgl = drawWebgl;
//# sourceMappingURL=draw_webgl.js.map