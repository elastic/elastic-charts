"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerCursorSelector = void 0;
const picked_shapes_1 = require("./picked_shapes");
const constants_1 = require("../../../../common/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
const is_brushing_1 = require("../../../../state/selectors/is_brushing");
exports.getPointerCursorSelector = (0, create_selector_1.createCustomCachedSelector)([picked_shapes_1.getPickedShapes, is_brushing_1.isBrushingSelector, get_tooltip_interaction_state_1.getTooltipInteractionState], (pickedShapes, isBrushing, tooltipState) => {
    if (tooltipState.pinned)
        return;
    return isBrushing || (0, picked_shapes_1.hasPicketVisibleCells)(pickedShapes) ? 'pointer' : constants_1.DEFAULT_CSS_CURSOR;
});
//# sourceMappingURL=get_cursor_pointer.js.map