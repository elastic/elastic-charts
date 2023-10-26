"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTooltipVisibleSelector = void 0;
const tooltip_1 = require("./tooltip");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
exports.isTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_spec_1.getTooltipSpecSelector, tooltip_1.getTooltipInfoSelector], ({ type }, tooltipInfo) => {
    return type !== constants_1.TooltipType.None && tooltipInfo.values.length > 0;
});
//# sourceMappingURL=is_tooltip_visible.js.map