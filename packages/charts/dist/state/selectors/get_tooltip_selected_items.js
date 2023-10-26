"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipSelectedItems = exports.getTooltipPinned = exports.getTooltipToggledItems = void 0;
const create_selector_1 = require("../create_selector");
const getTooltipToggledItems = (state) => state.interactions.tooltip.selected;
exports.getTooltipToggledItems = getTooltipToggledItems;
const getTooltipPinned = (state) => state.interactions.tooltip.pinned;
exports.getTooltipPinned = getTooltipPinned;
exports.getTooltipSelectedItems = (0, create_selector_1.createCustomCachedSelector)([exports.getTooltipToggledItems, exports.getTooltipPinned], (toggledItems, tooltipStick) => {
    if (!tooltipStick) {
        return [];
    }
    return toggledItems;
});
//# sourceMappingURL=get_tooltip_selected_items.js.map