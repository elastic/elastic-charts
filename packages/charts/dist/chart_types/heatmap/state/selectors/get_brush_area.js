"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrushAreaSelector = void 0;
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var common_1 = require("../../../../utils/common");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var get_brushed_highlighted_shapes_1 = require("./get_brushed_highlighted_shapes");
var getMouseDownPosition = function (state) { return state.interactions.pointer.down; };
var getIsDragging = function (state) { return state.interactions.pointer.dragging; };
exports.getBrushAreaSelector = (0, create_selector_1.createCustomCachedSelector)([
    getIsDragging,
    getMouseDownPosition,
    get_active_pointer_position_1.getActivePointerPosition,
    get_settings_spec_1.getSettingsSpecSelector,
    compute_chart_dimensions_1.computeChartElementSizesSelector,
    get_brushed_highlighted_shapes_1.getBrushedHighlightedShapesSelector,
], function (isDragging, mouseDownPosition, end, _a, dims, dragShape) {
    var brushAxis = _a.brushAxis;
    if (!isDragging || !mouseDownPosition || !dragShape) {
        return null;
    }
    var start = {
        x: mouseDownPosition.position.x - dims.grid.left,
        y: mouseDownPosition.position.y,
    };
    var clampedEndY = (0, common_1.clamp)(end.y, 0, dims.grid.height);
    switch (brushAxis) {
        case specs_1.BrushAxis.Both:
            return {
                top: start.y,
                left: start.x,
                width: end.x - start.x - dims.grid.left,
                height: clampedEndY - start.y,
            };
        default:
            return {
                top: start.y,
                left: start.x,
                width: end.x - start.x - dims.grid.left,
                height: clampedEndY - start.y,
            };
    }
});
//# sourceMappingURL=get_brush_area.js.map