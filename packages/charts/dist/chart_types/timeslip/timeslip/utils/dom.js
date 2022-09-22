"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementSizes = exports.zoomSafePointerY = exports.zoomSafePointerX = void 0;
var zoomSafePointerX = function (e) { var _a; return (_a = e.layerX) !== null && _a !== void 0 ? _a : e.clientX; };
exports.zoomSafePointerX = zoomSafePointerX;
var zoomSafePointerY = function (e) { var _a; return (_a = e.layerY) !== null && _a !== void 0 ? _a : e.clientX; };
exports.zoomSafePointerY = zoomSafePointerY;
var elementSizes = function (canvas, horizontalPad, verticalPad) {
    var _a = canvas.getBoundingClientRect(), outerWidth = _a.width, outerHeight = _a.height;
    var innerLeft = outerWidth * horizontalPad[0];
    var innerWidth = outerWidth * (1 - horizontalPad.reduce(function (p, n) { return p + n; }));
    var innerRight = innerLeft + innerWidth;
    var innerTop = outerHeight * verticalPad[0];
    var innerHeight = outerHeight * (1 - verticalPad.reduce(function (p, n) { return p + n; }));
    var innerBottom = innerTop + innerHeight;
    return {
        outerWidth: outerWidth,
        outerHeight: outerHeight,
        innerLeft: innerLeft,
        innerRight: innerRight,
        innerWidth: innerWidth,
        innerTop: innerTop,
        innerBottom: innerBottom,
        innerHeight: innerHeight,
    };
};
exports.elementSizes = elementSizes;
//# sourceMappingURL=dom.js.map