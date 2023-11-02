"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTooltipVisibleSelector = void 0;
const tooltip_1 = require("./tooltip");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
const get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
exports.isTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_spec_1.getTooltipSpecSelector, tooltip_1.getTooltipInfoSelector, get_tooltip_interaction_state_1.getTooltipInteractionState], ({ type }, tooltipInfo, { pinned }) => {
    if (type === constants_1.TooltipType.None) {
        return {
            visible: false,
            isExternal: false,
            displayOnly: false,
            isPinnable: false,
        };
    }
    return {
        visible: tooltipInfo.values.length > 0 || pinned,
        displayOnly: tooltipInfo.values.every(({ displayOnly }) => displayOnly),
        isExternal: false,
        isPinnable: tooltipInfo.values.length > 0,
    };
});
//# sourceMappingURL=is_tooltip_visible.js.map