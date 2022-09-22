"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawWebgl = void 0;
var shaders_1 = require("../shaders");
var common_1 = require("./common");
var MAX_PADDING_RATIO = 0.25;
var MIN_FILL_RATIO = [1 - MAX_PADDING_RATIO, 0.6];
var CORNER_RADIUS_RATIO = 0.25;
var VERTICES_PER_GEOM = 4;
var DUMMY_INDEX = -1;
var drawWebgl = function (gl, logicalTime, canvasWidth, canvasHeight, xOffset, yOffset, pickTexture, renderer, hoverIndex, rowHeight, f, instanceCount, focusLayer, pickLayer, wobbleIndex, wobble) {
    return renderer({
        target: pickLayer ? pickTexture.target() : null,
        uniformValues: {
            pickLayer: pickLayer,
            t: Math.max(0.001, logicalTime),
            resolution: [canvasWidth, canvasHeight],
            gapPx: pickLayer || !focusLayer ? [0, 0] : [common_1.BOX_GAP_HORIZONTAL, common_1.BOX_GAP_VERTICAL],
            minFillRatio: MIN_FILL_RATIO,
            cornerRadiusPx: pickLayer ? 0 : canvasHeight * rowHeight * CORNER_RADIUS_RATIO,
            hoverIndex: Number.isFinite(hoverIndex) ? hoverIndex + shaders_1.GEOM_INDEX_OFFSET : DUMMY_INDEX,
            wobbleIndex: Number.isFinite(wobbleIndex) ? wobbleIndex + shaders_1.GEOM_INDEX_OFFSET : DUMMY_INDEX,
            wobble: wobble,
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
                instanceCount: instanceCount,
            },
    });
};
exports.drawWebgl = drawWebgl;
//# sourceMappingURL=draw_webgl.js.map