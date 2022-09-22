"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundUpSize = exports.BOX_GAP_VERTICAL = exports.BOX_GAP_HORIZONTAL = void 0;
exports.BOX_GAP_HORIZONTAL = 0.5;
exports.BOX_GAP_VERTICAL = 2;
var CANVAS_SIZE_INCREMENT = 256;
var roundUpSize = function (cssPixelSize) {
    return CANVAS_SIZE_INCREMENT * Math.ceil(cssPixelSize / CANVAS_SIZE_INCREMENT);
};
exports.roundUpSize = roundUpSize;
//# sourceMappingURL=common.js.map