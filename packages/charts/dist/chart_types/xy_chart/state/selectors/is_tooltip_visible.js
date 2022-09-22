"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTooltipVisibleSelector = void 0;
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
var is_external_tooltip_visible_1 = require("../../../../state/selectors/is_external_tooltip_visible");
var get_tooltip_spec_1 = require("./../../../../state/selectors/get_tooltip_spec");
var get_projected_pointer_position_1 = require("./get_projected_pointer_position");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
var is_annotation_tooltip_visible_1 = require("./is_annotation_tooltip_visible");
exports.isTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_tooltip_spec_1.getTooltipSpecSelector,
    get_tooltip_interaction_state_1.getTooltipInteractionState,
    get_projected_pointer_position_1.getProjectedPointerPositionSelector,
    get_tooltip_values_highlighted_geoms_1.getTooltipInfoSelector,
    is_annotation_tooltip_visible_1.isAnnotationTooltipVisibleSelector,
    is_external_tooltip_visible_1.isExternalTooltipVisibleSelector,
], isTooltipVisible);
function isTooltipVisible(_a, _b, projectedPointerPosition, tooltip, isAnnotationTooltipVisible, externalTooltipVisible) {
    var tooltipType = _a.type;
    var pinned = _b.pinned;
    var isLocalTooltip = tooltipType !== constants_1.TooltipType.None &&
        projectedPointerPosition.x > -1 &&
        projectedPointerPosition.y > -1 &&
        tooltip.values.length > 0 &&
        !isAnnotationTooltipVisible;
    var isExternalTooltip = externalTooltipVisible && tooltip.values.length > 0;
    return {
        visible: isLocalTooltip || isExternalTooltip || pinned,
        isExternal: externalTooltipVisible,
        displayOnly: false,
    };
}
//# sourceMappingURL=is_tooltip_visible.js.map