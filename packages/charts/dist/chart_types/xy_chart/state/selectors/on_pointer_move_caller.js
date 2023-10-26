"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnPointerMoveCaller = void 0;
const compute_series_geometries_1 = require("./compute_series_geometries");
const get_geometries_index_keys_1 = require("./get_geometries_index_keys");
const get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
const __1 = require("../../..");
const specs_1 = require("../../../../specs");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_id_1 = require("../../../../state/selectors/get_chart_id");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const common_1 = require("../../../../utils/common");
const getPointerEventSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_chart_id_1.getChartIdSelector,
    get_oriented_projected_pointer_position_1.getOrientedProjectedPointerPositionSelector,
    compute_series_geometries_1.computeSeriesGeometriesSelector,
    get_geometries_index_keys_1.getGeometriesIndexKeysSelector,
], (chartId, orientedProjectedPointerPosition, seriesGeometries, geometriesIndexKeys) => getPointerEvent(chartId, orientedProjectedPointerPosition, seriesGeometries.scales, geometriesIndexKeys));
function getPointerEvent(chartId, orientedProjectedPointerPosition, { xScale, yScales }, geometriesIndexKeys) {
    if (!xScale) {
        return { chartId, type: constants_1.PointerEventType.Out };
    }
    const { x, y, verticalPanelValue, horizontalPanelValue } = orientedProjectedPointerPosition;
    if (x === -1 || y === -1) {
        return { chartId, type: constants_1.PointerEventType.Out };
    }
    const xValue = xScale.invertWithStep(x, geometriesIndexKeys).value;
    if ((0, common_1.isNil)(xValue) || Number.isNaN(xValue)) {
        return { chartId, type: constants_1.PointerEventType.Out };
    }
    return {
        chartId,
        type: constants_1.PointerEventType.Over,
        unit: xScale.unit,
        scale: xScale.type,
        x: xValue,
        y: [...yScales.entries()].map(([groupId, yScale]) => {
            return { value: yScale.invert(y), groupId };
        }),
        smVerticalValue: verticalPanelValue,
        smHorizontalValue: horizontalPanelValue,
    };
}
function isSameEventValue(a, b, changeTrigger) {
    const checkX = changeTrigger === specs_1.PointerUpdateTrigger.X || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    const checkY = changeTrigger === specs_1.PointerUpdateTrigger.Y || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    return ((!checkX || (a.x === b.x && a.scale === b.scale && a.unit === b.unit)) &&
        (!checkY || a.y.every((y, i) => { var _a; return y.value === ((_a = b.y[i]) === null || _a === void 0 ? void 0 : _a.value); })));
}
const hasPointerEventChanged = (prev, next, changeTrigger) => (next === null || next === void 0 ? void 0 : next.type) !== prev.type ||
    (prev.type === constants_1.PointerEventType.Over &&
        (next === null || next === void 0 ? void 0 : next.type) === constants_1.PointerEventType.Over &&
        !isSameEventValue(prev, next, changeTrigger));
function createOnPointerMoveCaller() {
    let prevPointerEvent = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, getPointerEventSelector, get_chart_id_1.getChartIdSelector], ({ onPointerUpdate, pointerUpdateTrigger }, nextPointerEvent, chartId) => {
                if (prevPointerEvent === null) {
                    prevPointerEvent = { chartId, type: constants_1.PointerEventType.Out };
                }
                const tempPrev = { ...prevPointerEvent };
                prevPointerEvent = nextPointerEvent;
                if (onPointerUpdate && hasPointerEventChanged(tempPrev, nextPointerEvent, pointerUpdateTrigger))
                    onPointerUpdate(nextPointerEvent);
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnPointerMoveCaller = createOnPointerMoveCaller;
//# sourceMappingURL=on_pointer_move_caller.js.map