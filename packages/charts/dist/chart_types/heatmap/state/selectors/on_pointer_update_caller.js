"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnPointerUpdateCaller = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const picked_shapes_1 = require("./picked_shapes");
const __1 = require("../../..");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
const get_chart_id_1 = require("../../../../state/selectors/get_chart_id");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
function isSameEventValue(a, b, changeTrigger) {
    const checkX = changeTrigger === specs_1.PointerUpdateTrigger.X || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    const checkY = changeTrigger === specs_1.PointerUpdateTrigger.Y || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    return ((!checkX || (a.x === b.x && a.scale === b.scale && a.unit === b.unit)) &&
        (!checkY || a.y.every((y, i) => { var _a; return y.value === ((_a = b.y[i]) === null || _a === void 0 ? void 0 : _a.value); })));
}
const hasPointerEventChanged = (prev, next, changeTrigger) => (next === null || next === void 0 ? void 0 : next.type) !== prev.type ||
    (prev.type === specs_1.PointerEventType.Over &&
        (next === null || next === void 0 ? void 0 : next.type) === specs_1.PointerEventType.Over &&
        !isSameEventValue(prev, next, changeTrigger));
function createOnPointerUpdateCaller() {
    let prevPointerEvent = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([
                get_heatmap_spec_1.getHeatmapSpecSelector,
                get_settings_spec_1.getSettingsSpecSelector,
                get_active_pointer_position_1.getActivePointerPosition,
                picked_shapes_1.getPickedGridCell,
                get_chart_id_1.getChartIdSelector,
            ], (spec, settings, currentPointer, gridCell, chartId) => {
                if (!spec) {
                    return;
                }
                if (prevPointerEvent === null) {
                    prevPointerEvent = { chartId, type: specs_1.PointerEventType.Out };
                }
                const tempPrev = { ...prevPointerEvent };
                const nextPointerEvent = gridCell
                    ? {
                        chartId: state.chartId,
                        type: currentPointer.x === -1 && currentPointer.y === -1 ? specs_1.PointerEventType.Out : specs_1.PointerEventType.Over,
                        scale: spec.xScale.type,
                        x: gridCell.x,
                        y: [{ value: gridCell.y, groupId: '' }],
                        smHorizontalValue: null,
                        smVerticalValue: null,
                    }
                    : { chartId, type: specs_1.PointerEventType.Out };
                prevPointerEvent = nextPointerEvent;
                if (settings.onPointerUpdate &&
                    hasPointerEventChanged(tempPrev, nextPointerEvent, settings.pointerUpdateTrigger)) {
                    settings.onPointerUpdate(nextPointerEvent);
                }
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnPointerUpdateCaller = createOnPointerUpdateCaller;
//# sourceMappingURL=on_pointer_update_caller.js.map