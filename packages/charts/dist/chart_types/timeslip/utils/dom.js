"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementSize = exports.zoomSafePointerY = exports.zoomSafePointerX = void 0;
const zoomSafePointerX = (e) => e.offsetX;
exports.zoomSafePointerX = zoomSafePointerX;
const zoomSafePointerY = (e) => e.offsetY;
exports.zoomSafePointerY = zoomSafePointerY;
const elementSize = (canvas, horizontal, pad) => {
    const outerSize = Number.parseFloat(horizontal ? canvas.style.width : canvas.style.height);
    const innerLeading = outerSize * pad[0];
    const innerSize = outerSize * (1 - pad.reduce((p, n) => p + n));
    const innerTrailing = innerLeading + innerSize;
    return {
        outerSize,
        innerLeading,
        innerTrailing,
        innerSize,
    };
};
exports.elementSize = elementSize;
//# sourceMappingURL=dom.js.map