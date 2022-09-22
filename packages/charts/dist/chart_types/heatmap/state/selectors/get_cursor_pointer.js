"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerCursorSelector = void 0;
var constants_1 = require("../../../../common/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
var is_brushing_1 = require("./is_brushing");
var picked_shapes_1 = require("./picked_shapes");
exports.getPointerCursorSelector = (0, create_selector_1.createCustomCachedSelector)([picked_shapes_1.getPickedShapes, is_brushing_1.isBrushingSelector, get_tooltip_interaction_state_1.getTooltipInteractionState], function (pickedShapes, isBrushing, tooltipState) {
    if (tooltipState.pinned)
        return;
    return isBrushing || (Array.isArray(pickedShapes) && pickedShapes.some(function (_a) {
        var visible = _a.visible;
        return visible;
    }))
        ? 'pointer'
        : constants_1.DEFAULT_CSS_CURSOR;
});
//# sourceMappingURL=get_cursor_pointer.js.map