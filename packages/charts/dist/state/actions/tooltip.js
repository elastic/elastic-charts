"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSelectedTooltipItems = exports.toggleSelectedTooltipItem = exports.pinTooltip = exports.SET_SELECTED_TOOLTIP_ITEMS = exports.TOGGLE_SELECTED_TOOLTIP_ITEM = exports.PIN_TOOLTIP = void 0;
exports.PIN_TOOLTIP = 'PIN_TOOLTIP';
exports.TOGGLE_SELECTED_TOOLTIP_ITEM = 'TOGGLE_SELECTED_TOOLTIP_ITEM';
exports.SET_SELECTED_TOOLTIP_ITEMS = 'SET_SELECTED_TOOLTIP_ITEMS';
function pinTooltip(pinned, resetPointer = false) {
    return { type: exports.PIN_TOOLTIP, pinned, resetPointer };
}
exports.pinTooltip = pinTooltip;
function toggleSelectedTooltipItem(item) {
    return { type: exports.TOGGLE_SELECTED_TOOLTIP_ITEM, item };
}
exports.toggleSelectedTooltipItem = toggleSelectedTooltipItem;
function setSelectedTooltipItems(items) {
    return { type: exports.SET_SELECTED_TOOLTIP_ITEMS, items };
}
exports.setSelectedTooltipItems = setSelectedTooltipItems;
//# sourceMappingURL=tooltip.js.map