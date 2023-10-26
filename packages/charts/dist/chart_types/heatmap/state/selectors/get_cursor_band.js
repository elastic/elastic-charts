"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCursorBandPositionSelector = void 0;
const get_per_panel_heatmap_geometries_1 = require("./get_per_panel_heatmap_geometries");
const get_tooltip_anchor_1 = require("./get_tooltip_anchor");
const picked_shapes_1 = require("./picked_shapes");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_internal_is_brushing_1 = require("../../../../state/selectors/get_internal_is_brushing");
const common_1 = require("../../../../utils/common");
const getExternalPointerEventStateSelector = (state) => state.externalEvents.pointer;
exports.getCursorBandPositionSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries,
    getExternalPointerEventStateSelector,
    picked_shapes_1.getPickedShapes,
    get_tooltip_anchor_1.getTooltipAnchorSelector,
    get_internal_is_brushing_1.getInternalIsBrushingSelector,
], (geoms, externalPointerEvent, pickedShapes, tooltipShape, isBrushing) => {
    if (isBrushing)
        return;
    if ((0, specs_1.isPointerOverEvent)(externalPointerEvent)) {
        const { x } = externalPointerEvent;
        if (!(0, common_1.isNil)(x)) {
            const band = geoms.pickCursorBand(x);
            if (band) {
                return {
                    ...band,
                    fromExternalEvent: true,
                };
            }
        }
    }
    if ((0, picked_shapes_1.hasPicketVisibleCells)(pickedShapes)) {
        return {
            ...tooltipShape,
            fromExternalEvent: false,
        };
    }
});
//# sourceMappingURL=get_cursor_band.js.map