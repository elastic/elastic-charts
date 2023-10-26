"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStylesFromPlacement = void 0;
function getStylesFromPlacement(actionable, { maxWidth }, placement) {
    if (!actionable)
        return { maxWidth };
    switch (placement) {
        case 'left':
        case 'left-start':
        case 'left-end':
        case 'top-end':
        case 'bottom-end':
            return {
                width: maxWidth,
                justifyContent: 'flex-end',
            };
        case 'right':
        case 'right-start':
        case 'right-end':
        case 'top-start':
        case 'bottom-start':
            return {
                width: maxWidth,
                justifyContent: 'flex-start',
            };
        case 'top':
        case 'bottom':
            return {
                width: maxWidth,
                justifyContent: 'center',
            };
        case 'auto':
        case 'auto-start':
        case 'auto-end':
        default:
            return {
                width: maxWidth,
            };
    }
}
exports.getStylesFromPlacement = getStylesFromPlacement;
//# sourceMappingURL=placement.js.map