"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTooltipItemSelected = exports.onTooltipPinned = exports.ON_TOOLTIP_ITEM_SELECTED = exports.ON_TOOLTIP_PINNED = void 0;
exports.ON_TOOLTIP_PINNED = 'ON_TOOLTIP_PINNED';
exports.ON_TOOLTIP_ITEM_SELECTED = 'ON_TOOLTIP_ITEM_SELECTED';
function onTooltipPinned(pinned, resetPointer) {
    if (resetPointer === void 0) { resetPointer = false; }
    return { type: exports.ON_TOOLTIP_PINNED, pinned: pinned, resetPointer: resetPointer };
}
exports.onTooltipPinned = onTooltipPinned;
function onTooltipItemSelected(selected) {
    return { type: exports.ON_TOOLTIP_ITEM_SELECTED, selected: selected };
}
exports.onTooltipItemSelected = onTooltipItemSelected;
//# sourceMappingURL=tooltip.js.map