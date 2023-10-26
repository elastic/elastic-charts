"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrushAreaSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_brushed_highlighted_shapes_1 = require("./get_brushed_highlighted_shapes");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const is_brushing_1 = require("../../../../state/selectors/is_brushing");
const common_1 = require("../../../../utils/common");
const getMouseDownPosition = (state) => state.interactions.pointer.down;
exports.getBrushAreaSelector = (0, create_selector_1.createCustomCachedSelector)([
    is_brushing_1.isBrushingSelector,
    getMouseDownPosition,
    get_active_pointer_position_1.getActivePointerPosition,
    get_settings_spec_1.getSettingsSpecSelector,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_brushed_highlighted_shapes_1.getBrushedHighlightedShapesSelector,
], (isBrushing, mouseDownPosition, end, { brushAxis }, { chartDimensions }, dragShape) => {
    if (!isBrushing || !mouseDownPosition || !dragShape) {
        return null;
    }
    const start = {
        x: mouseDownPosition.position.x - chartDimensions.left,
        y: mouseDownPosition.position.y,
    };
    const clampedEndY = (0, common_1.clamp)(end.y, 0, chartDimensions.height);
    switch (brushAxis) {
        case specs_1.BrushAxis.Both:
            return {
                top: start.y,
                left: start.x,
                width: end.x - start.x - chartDimensions.left,
                height: clampedEndY - start.y,
            };
        default:
            return {
                top: start.y,
                left: start.x,
                width: end.x - start.x - chartDimensions.left,
                height: clampedEndY - start.y,
            };
    }
});
//# sourceMappingURL=get_brush_area.js.map