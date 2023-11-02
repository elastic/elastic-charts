"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitialTooltipState = exports.getInitialPointerState = exports.isClicking = exports.getSpecFromStore = exports.getSpecsFromStore = void 0;
function getSpecsFromStore(specs, chartType, specType) {
    return Object.values(specs).filter((spec) => spec.chartType === chartType && spec.specType === specType);
}
exports.getSpecsFromStore = getSpecsFromStore;
function getSpecFromStore(specs, chartType, specType, required) {
    const spec = Object.values(specs).find((spec) => spec.chartType === chartType && spec.specType === specType);
    if (!spec && required)
        throw new Error(`Unable to find spec [${chartType} = ${specType}]`);
    return spec !== null && spec !== void 0 ? spec : null;
}
exports.getSpecFromStore = getSpecFromStore;
function isClicking(prevClick, lastClick) {
    return lastClick && (!prevClick || prevClick.time !== lastClick.time);
}
exports.isClicking = isClicking;
const getInitialPointerState = () => ({
    dragging: false,
    current: { position: { x: -1, y: -1 }, time: 0 },
    pinned: null,
    down: null,
    up: null,
    lastDrag: null,
    lastClick: null,
});
exports.getInitialPointerState = getInitialPointerState;
const getInitialTooltipState = () => ({
    pinned: false,
    selected: [],
});
exports.getInitialTooltipState = getInitialTooltipState;
//# sourceMappingURL=utils.js.map