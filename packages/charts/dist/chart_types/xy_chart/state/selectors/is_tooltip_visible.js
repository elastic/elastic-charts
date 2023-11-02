"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTooltipVisibleSelector = void 0;
const tooltip_1 = require("./../../../../specs/tooltip");
const get_tooltip_spec_1 = require("./../../../../state/selectors/get_tooltip_spec");
const get_projected_pointer_position_1 = require("./get_projected_pointer_position");
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const is_annotation_tooltip_visible_1 = require("./is_annotation_tooltip_visible");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
const is_external_tooltip_visible_1 = require("../../../../state/selectors/is_external_tooltip_visible");
exports.isTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_tooltip_spec_1.getTooltipSpecSelector,
    get_tooltip_interaction_state_1.getTooltipInteractionState,
    get_projected_pointer_position_1.getProjectedPointerPositionSelector,
    get_tooltip_values_highlighted_geoms_1.getTooltipInfoAndGeomsSelector,
    is_annotation_tooltip_visible_1.isAnnotationTooltipVisibleSelector,
    is_external_tooltip_visible_1.isExternalTooltipVisibleSelector,
], isTooltipVisible);
function isTooltipVisible({ type: tooltipType, maxTooltipItems }, { pinned }, projectedPointerPosition, { tooltip, highlightedGeometries }, isAnnotationTooltipVisible, externalTooltipVisible) {
    const visibleTooltip = (0, tooltip_1.isFollowTooltipType)(tooltipType)
        ? highlightedGeometries
        : tooltip.values.length > maxTooltipItems && highlightedGeometries.length > 0
            ? highlightedGeometries
            : tooltip.values;
    const isLocalTooltip = tooltipType !== constants_1.TooltipType.None &&
        projectedPointerPosition.x > -1 &&
        projectedPointerPosition.y > -1 &&
        visibleTooltip.length > 0 &&
        !isAnnotationTooltipVisible;
    const isExternalTooltip = externalTooltipVisible && visibleTooltip.length > 0;
    return {
        visible: isLocalTooltip || isExternalTooltip || pinned,
        isExternal: externalTooltipVisible,
        displayOnly: false,
        isPinnable: tooltip.values.length > 0,
    };
}
//# sourceMappingURL=is_tooltip_visible.js.map