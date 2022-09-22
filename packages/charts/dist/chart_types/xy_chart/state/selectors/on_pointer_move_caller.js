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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnPointerMoveCaller = void 0;
var __1 = require("../../..");
var specs_1 = require("../../../../specs");
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_id_1 = require("../../../../state/selectors/get_chart_id");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var common_1 = require("../../../../utils/common");
var compute_series_geometries_1 = require("./compute_series_geometries");
var get_geometries_index_keys_1 = require("./get_geometries_index_keys");
var get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
var getPointerEventSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_chart_id_1.getChartIdSelector,
    get_oriented_projected_pointer_position_1.getOrientedProjectedPointerPositionSelector,
    compute_series_geometries_1.computeSeriesGeometriesSelector,
    get_geometries_index_keys_1.getGeometriesIndexKeysSelector,
], function (chartId, orientedProjectedPointerPosition, seriesGeometries, geometriesIndexKeys) {
    return getPointerEvent(chartId, orientedProjectedPointerPosition, seriesGeometries.scales, geometriesIndexKeys);
});
function getPointerEvent(chartId, orientedProjectedPointerPosition, _a, geometriesIndexKeys) {
    var xScale = _a.xScale, yScales = _a.yScales;
    if (!xScale) {
        return { chartId: chartId, type: constants_1.PointerEventType.Out };
    }
    var x = orientedProjectedPointerPosition.x, y = orientedProjectedPointerPosition.y, verticalPanelValue = orientedProjectedPointerPosition.verticalPanelValue, horizontalPanelValue = orientedProjectedPointerPosition.horizontalPanelValue;
    if (x === -1 || y === -1) {
        return { chartId: chartId, type: constants_1.PointerEventType.Out };
    }
    var xValue = xScale.invertWithStep(x, geometriesIndexKeys).value;
    if ((0, common_1.isNil)(xValue) || Number.isNaN(xValue)) {
        return { chartId: chartId, type: constants_1.PointerEventType.Out };
    }
    return {
        chartId: chartId,
        type: constants_1.PointerEventType.Over,
        unit: xScale.unit,
        scale: xScale.type,
        x: xValue,
        y: __spreadArray([], __read(yScales.entries()), false).map(function (_a) {
            var _b = __read(_a, 2), groupId = _b[0], yScale = _b[1];
            return { value: yScale.invert(y), groupId: groupId };
        }),
        smVerticalValue: verticalPanelValue,
        smHorizontalValue: horizontalPanelValue,
    };
}
function isSameEventValue(a, b, changeTrigger) {
    var checkX = changeTrigger === specs_1.PointerUpdateTrigger.X || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    var checkY = changeTrigger === specs_1.PointerUpdateTrigger.Y || changeTrigger === specs_1.PointerUpdateTrigger.Both;
    return ((!checkX || (a.x === b.x && a.scale === b.scale && a.unit === b.unit)) &&
        (!checkY || a.y.every(function (y, i) { var _a; return y.value === ((_a = b.y[i]) === null || _a === void 0 ? void 0 : _a.value); })));
}
var hasPointerEventChanged = function (prev, next, changeTrigger) {
    return (next === null || next === void 0 ? void 0 : next.type) !== prev.type ||
        (prev.type === constants_1.PointerEventType.Over &&
            (next === null || next === void 0 ? void 0 : next.type) === constants_1.PointerEventType.Over &&
            !isSameEventValue(prev, next, changeTrigger));
};
function createOnPointerMoveCaller() {
    var prevPointerEvent = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, getPointerEventSelector, get_chart_id_1.getChartIdSelector], function (_a, nextPointerEvent, chartId) {
                var onPointerUpdate = _a.onPointerUpdate, pointerUpdateTrigger = _a.pointerUpdateTrigger;
                if (prevPointerEvent === null) {
                    prevPointerEvent = { chartId: chartId, type: constants_1.PointerEventType.Out };
                }
                var tempPrev = __assign({}, prevPointerEvent);
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