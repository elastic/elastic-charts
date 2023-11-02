"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnBrushEndCaller = void 0;
const get_picked_cells_1 = require("./get_picked_cells");
const is_brush_available_1 = require("./is_brush_available");
const __1 = require("../../..");
const create_selector_1 = require("../../../../state/create_selector");
const get_last_drag_1 = require("../../../../state/selectors/get_last_drag");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const events_1 = require("../../../../utils/events");
function createOnBrushEndCaller() {
    let prevProps = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            if (!(0, is_brush_available_1.isBrushEndProvided)(state)) {
                selector = null;
                prevProps = null;
                return;
            }
            selector = (0, create_selector_1.createCustomCachedSelector)([get_last_drag_1.getLastDragSelector, get_settings_spec_1.getSettingsSpecSelector, get_picked_cells_1.getPickedCells], (lastDrag, { onBrushEnd }, pickedCells) => {
                const nextProps = {
                    lastDrag,
                    onBrushEnd,
                };
                if (!onBrushEnd || pickedCells === null) {
                    return;
                }
                if (lastDrag !== null && (0, events_1.hasDragged)(prevProps, nextProps)) {
                    onBrushEnd(pickedCells);
                }
                prevProps = nextProps;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnBrushEndCaller = createOnBrushEndCaller;
//# sourceMappingURL=on_brush_end_caller.js.map