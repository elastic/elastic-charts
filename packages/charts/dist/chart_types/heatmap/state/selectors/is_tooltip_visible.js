"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTooltipVisibleSelector = void 0;
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
var get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
var tooltip_1 = require("./tooltip");
exports.isTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_spec_1.getTooltipSpecSelector, tooltip_1.getTooltipInfoSelector, get_tooltip_interaction_state_1.getTooltipInteractionState], function (_a, tooltipInfo, _b) {
    var type = _a.type;
    var pinned = _b.pinned;
    if (type === constants_1.TooltipType.None) {
        return {
            visible: false,
            isExternal: false,
            displayOnly: false,
        };
    }
    return {
        visible: tooltipInfo.values.length > 0 || pinned,
        displayOnly: tooltipInfo.values.every(function (_a) {
            var displayOnly = _a.displayOnly;
            return displayOnly;
        }),
        isExternal: false,
    };
});
//# sourceMappingURL=is_tooltip_visible.js.map