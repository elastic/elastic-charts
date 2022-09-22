"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnBrushEndCaller = void 0;
var __1 = require("../../..");
var create_selector_1 = require("../../../../state/create_selector");
var get_last_drag_1 = require("../../../../state/selectors/get_last_drag");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var events_1 = require("../../../../utils/events");
var get_picked_cells_1 = require("./get_picked_cells");
var heatmap_spec_1 = require("./heatmap_spec");
var is_brush_available_1 = require("./is_brush_available");
function createOnBrushEndCaller() {
    var prevProps = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            if (!(0, is_brush_available_1.isBrushEndProvided)(state)) {
                selector = null;
                prevProps = null;
                return;
            }
            selector = (0, create_selector_1.createCustomCachedSelector)([get_last_drag_1.getLastDragSelector, heatmap_spec_1.getSpecOrNull, get_settings_spec_1.getSettingsSpecSelector, get_picked_cells_1.getPickedCells], function (lastDrag, spec, _a, pickedCells) {
                var onBrushEnd = _a.onBrushEnd;
                var nextProps = {
                    lastDrag: lastDrag,
                    onBrushEnd: onBrushEnd,
                };
                if (!spec || !onBrushEnd || pickedCells === null) {
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