"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipSelectedItems = exports.getTooltipPinned = exports.getTooltipToggledItems = void 0;
var create_selector_1 = require("../create_selector");
var getTooltipToggledItems = function (state) { return state.interactions.tooltip.selected; };
exports.getTooltipToggledItems = getTooltipToggledItems;
var getTooltipPinned = function (state) { return state.interactions.tooltip.pinned; };
exports.getTooltipPinned = getTooltipPinned;
exports.getTooltipSelectedItems = (0, create_selector_1.createCustomCachedSelector)([exports.getTooltipToggledItems, exports.getTooltipPinned], function (toggledItems, tooltipStick) {
    if (!tooltipStick) {
        return [];
    }
    return toggledItems;
});
//# sourceMappingURL=get_tooltip_selected_items.js.map