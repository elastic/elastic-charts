"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitialTooltipState = exports.getInitialPointerState = exports.isClicking = exports.getSpecsFromStore = void 0;
function getSpecsFromStore(specs, chartType, specType) {
    return Object.values(specs).filter(function (spec) { return spec.chartType === chartType && spec.specType === specType; });
}
exports.getSpecsFromStore = getSpecsFromStore;
function isClicking(prevClick, lastClick) {
    return lastClick && (!prevClick || prevClick.time !== lastClick.time);
}
exports.isClicking = isClicking;
var getInitialPointerState = function () { return ({
    dragging: false,
    current: { position: { x: -1, y: -1 }, time: 0 },
    pinned: null,
    down: null,
    up: null,
    lastDrag: null,
    lastClick: null,
}); };
exports.getInitialPointerState = getInitialPointerState;
var getInitialTooltipState = function () { return ({
    pinned: false,
    selected: [],
}); };
exports.getInitialTooltipState = getInitialTooltipState;
//# sourceMappingURL=utils.js.map