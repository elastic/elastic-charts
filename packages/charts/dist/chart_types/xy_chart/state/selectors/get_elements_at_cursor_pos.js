"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementAtCursorPositionSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_computed_scales_1 = require("./get_computed_scales");
const get_geometries_index_1 = require("./get_geometries_index");
const get_geometries_index_keys_1 = require("./get_geometries_index_keys");
const get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const common_1 = require("../../../../utils/common");
const events_1 = require("../../../../utils/events");
const common_2 = require("../utils/common");
const getExternalPointerEventStateSelector = (state) => state.externalEvents.pointer;
exports.getElementAtCursorPositionSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_oriented_projected_pointer_position_1.getOrientedProjectedPointerPositionSelector,
    get_computed_scales_1.getComputedScalesSelector,
    get_geometries_index_keys_1.getGeometriesIndexKeysSelector,
    get_geometries_index_1.getGeometriesIndexSelector,
    getExternalPointerEventStateSelector,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
], getElementAtCursorPosition);
function getElementAtCursorPosition(orientedProjectedPointerPosition, scales, geometriesIndexKeys, geometriesIndex, externalPointerEvent, { chartDimensions }, { pointBuffer }) {
    if ((0, events_1.isValidPointerOverEvent)(scales.xScale, externalPointerEvent)) {
        if ((0, common_1.isNil)(externalPointerEvent.x)) {
            return [];
        }
        const x = scales.xScale.pureScale(externalPointerEvent.x);
        if (Number.isNaN(x) || x > chartDimensions.width + chartDimensions.left || x < 0) {
            return [];
        }
        return geometriesIndex.find(externalPointerEvent.x, pointBuffer, { x: -1, y: -1 });
    }
    const xValue = scales.xScale.invertWithStep(orientedProjectedPointerPosition.x, geometriesIndexKeys).value;
    if ((0, common_1.isNil)(xValue) || Number.isNaN(xValue)) {
        return [];
    }
    return geometriesIndex
        .find(xValue, pointBuffer, orientedProjectedPointerPosition, orientedProjectedPointerPosition.horizontalPanelValue, orientedProjectedPointerPosition.verticalPanelValue)
        .sort((0, common_2.sortClosestToPoint)(orientedProjectedPointerPosition));
}
//# sourceMappingURL=get_elements_at_cursor_pos.js.map