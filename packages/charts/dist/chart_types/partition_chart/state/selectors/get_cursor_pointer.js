"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerCursorSelector = void 0;
var constants_1 = require("../../../../common/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
var picked_shapes_1 = require("./picked_shapes");
exports.getPointerCursorSelector = (0, create_selector_1.createCustomCachedSelector)([picked_shapes_1.getPickedShapes, get_settings_spec_1.getSettingsSpecSelector, get_tooltip_interaction_state_1.getTooltipInteractionState], function (pickedShapes, _a, tooltipState) {
    var onElementClick = _a.onElementClick, onElementOver = _a.onElementOver;
    if (tooltipState.pinned)
        return;
    return Array.isArray(pickedShapes) && pickedShapes.length > 0 && (onElementClick || onElementOver)
        ? 'pointer'
        : constants_1.DEFAULT_CSS_CURSOR;
});
//# sourceMappingURL=get_cursor_pointer.js.map