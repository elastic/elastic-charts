"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTooltipVisibleSelector = void 0;
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
var tooltip_1 = require("./tooltip");
exports.isTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_spec_1.getTooltipSpecSelector, tooltip_1.getTooltipInfoSelector], function (_a, tooltipInfo) {
    var type = _a.type;
    return type !== constants_1.TooltipType.None && tooltipInfo.values.length > 0;
});
//# sourceMappingURL=is_tooltip_visible.js.map