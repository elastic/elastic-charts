"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerCursorSelector = void 0;
const picked_shapes_1 = require("./picked_shapes");
const constants_1 = require("../../../../common/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
exports.getPointerCursorSelector = (0, create_selector_1.createCustomCachedSelector)([picked_shapes_1.getPickedShapes, get_settings_spec_1.getSettingsSpecSelector, get_tooltip_interaction_state_1.getTooltipInteractionState], (pickedShapes, { onElementClick, onElementOver }, tooltipState) => {
    if (tooltipState.pinned)
        return;
    return Array.isArray(pickedShapes) && pickedShapes.length > 0 && (onElementClick || onElementOver)
        ? 'pointer'
        : constants_1.DEFAULT_CSS_CURSOR;
});
//# sourceMappingURL=get_cursor_pointer.js.map