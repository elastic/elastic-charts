"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnPointerUpdateCaller = void 0;
var __1 = require("../../..");
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
var get_chart_id_1 = require("../../../../state/selectors/get_chart_id");
var get_last_click_1 = require("../../../../state/selectors/get_last_click");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var heatmap_spec_1 = require("./heatmap_spec");
var picked_shapes_1 = require("./picked_shapes");
function isSameEventValue(a, b, changeTrigger) {
    var checkX = changeTrigger === specs_1.PointerUpdateTrigger.X || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    var checkY = changeTrigger === specs_1.PointerUpdateTrigger.Y || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    return ((!checkX || (a.x === b.x && a.scale === b.scale && a.unit === b.unit)) &&
        (!checkY || a.y.every(function (y, i) { var _a; return y.value === ((_a = b.y[i]) === null || _a === void 0 ? void 0 : _a.value); })));
}
var hasPointerEventChanged = function (prev, next, changeTrigger) {
    return (next === null || next === void 0 ? void 0 : next.type) !== prev.type ||
        (prev.type === specs_1.PointerEventType.Over &&
            (next === null || next === void 0 ? void 0 : next.type) === specs_1.PointerEventType.Over &&
            !isSameEventValue(prev, next, changeTrigger));
};
function createOnPointerUpdateCaller() {
    var prevPointerEvent = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([
                heatmap_spec_1.getSpecOrNull,
                get_last_click_1.getLastClickSelector,
                get_settings_spec_1.getSettingsSpecSelector,
                get_active_pointer_position_1.getActivePointerPosition,
                picked_shapes_1.getPickedGridCell,
                get_chart_id_1.getChartIdSelector,
            ], function (spec, lastClick, settings, currentPointer, gridCell, chartId) {
                if (!spec) {
                    return;
                }
                if (prevPointerEvent === null) {
                    prevPointerEvent = { chartId: chartId, type: specs_1.PointerEventType.Out };
                }
                var tempPrev = __assign({}, prevPointerEvent);
                var nextPointerEvent = gridCell
                    ? {
                        chartId: state.chartId,
                        type: currentPointer.x === -1 && currentPointer.y === -1 ? specs_1.PointerEventType.Out : specs_1.PointerEventType.Over,
                        scale: spec.xScale.type,
                        x: gridCell.x,
                        y: [{ value: gridCell.y, groupId: '' }],
                        smHorizontalValue: null,
                        smVerticalValue: null,
                    }
                    : { chartId: chartId, type: specs_1.PointerEventType.Out };
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