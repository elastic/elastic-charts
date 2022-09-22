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
exports.interactionsReducer = void 0;
var chart_types_1 = require("../../chart_types");
var drilldown_active_1 = require("../../chart_types/partition_chart/state/selectors/drilldown_active");
var picked_shapes_1 = require("../../chart_types/partition_chart/state/selectors/picked_shapes");
var point_1 = require("../../utils/point");
var dom_element_1 = require("../actions/dom_element");
var key_1 = require("../actions/key");
var legend_1 = require("../actions/legend");
var mouse_1 = require("../actions/mouse");
var tooltip_1 = require("../actions/tooltip");
var get_internal_is_tooltip_visible_1 = require("../selectors/get_internal_is_tooltip_visible");
var get_internal_tooltip_info_1 = require("../selectors/get_internal_tooltip_info");
var utils_1 = require("../utils");
var DRAG_DETECTION_PIXEL_DELTA = 4;
function interactionsReducer(globalState, action, legendItems) {
    var _a, _b;
    var state = globalState.interactions;
    switch (action.type) {
        case key_1.ON_KEY_UP:
            if (action.key === 'Escape') {
                if (state.tooltip.pinned) {
                    return __assign(__assign({}, state), { pointer: (0, utils_1.getInitialPointerState)(), tooltip: (0, utils_1.getInitialTooltipState)() });
                }
                return __assign(__assign({}, state), { pointer: (0, utils_1.getInitialPointerState)() });
            }
            return state;
        case mouse_1.ON_POINTER_MOVE:
            var dragging = !!state.pointer.down && (0, point_1.getDelta)(state.pointer.down.position, action.position) > DRAG_DETECTION_PIXEL_DELTA;
            return __assign(__assign({}, state), { pointer: __assign(__assign({}, state.pointer), { dragging: dragging, current: {
                        position: __assign({}, action.position),
                        time: action.time,
                    } }) });
        case mouse_1.ON_MOUSE_DOWN:
            return __assign(__assign({}, state), { drilldown: getDrilldownData(globalState), prevDrilldown: state.drilldown, pointer: __assign(__assign({}, state.pointer), { dragging: false, up: null, down: {
                        position: __assign({}, action.position),
                        time: action.time,
                    } }) });
        case mouse_1.ON_MOUSE_UP: {
            return __assign(__assign({}, state), { pointer: __assign(__assign({}, state.pointer), { lastDrag: state.pointer.down && state.pointer.dragging
                        ? {
                            start: {
                                position: __assign({}, state.pointer.down.position),
                                time: state.pointer.down.time,
                            },
                            end: {
                                position: __assign({}, state.pointer.current.position),
                                time: action.time,
                            },
                        }
                        : null, lastClick: state.pointer.down && !state.pointer.dragging
                        ? {
                            position: __assign({}, action.position),
                            time: action.time,
                        }
                        : null, dragging: false, down: null, up: {
                        position: __assign({}, action.position),
                        time: action.time,
                    } }) });
        }
        case legend_1.ON_LEGEND_ITEM_OUT:
            return __assign(__assign({}, state), { highlightedLegendPath: [] });
        case legend_1.ON_LEGEND_ITEM_OVER:
            var highlightedLegendPath = action.legendPath;
            return __assign(__assign({}, state), { highlightedLegendPath: highlightedLegendPath });
        case legend_1.ON_TOGGLE_DESELECT_SERIES:
            return __assign(__assign({}, state), { deselectedDataSeries: toggleDeselectedDataSeries(action, state.deselectedDataSeries, legendItems) });
        case dom_element_1.ON_DOM_ELEMENT_ENTER:
            return __assign(__assign({}, state), { hoveredDOMElement: action.element });
        case dom_element_1.ON_DOM_ELEMENT_LEAVE:
            return __assign(__assign({}, state), { hoveredDOMElement: null });
        case tooltip_1.ON_TOOLTIP_PINNED: {
            if (!action.pinned) {
                return __assign(__assign({}, state), { pointer: action.resetPointer
                        ? (0, utils_1.getInitialPointerState)()
                        : __assign(__assign({}, state.pointer), { pinned: null }), tooltip: (0, utils_1.getInitialTooltipState)() });
            }
            var _c = (0, get_internal_is_tooltip_visible_1.getInternalIsTooltipVisibleSelector)(globalState), visible = _c.visible, displayOnly = _c.displayOnly;
            if (!visible || displayOnly) {
                return state;
            }
            var selected = ((_b = (_a = (0, get_internal_tooltip_info_1.getInternalTooltipInfoSelector)(globalState)) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : []).filter(function (v) {
                return globalState.chartType === chart_types_1.ChartType.XYAxis ? v.isHighlighted : !v.displayOnly;
            });
            return __assign(__assign({}, state), { tooltip: __assign(__assign({}, state.tooltip), { pinned: true, selected: selected }), pointer: __assign(__assign({}, state.pointer), { pinned: state.pointer.current }) });
        }
        case tooltip_1.ON_TOOLTIP_ITEM_SELECTED: {
            if (!state.tooltip.pinned)
                return state;
            var updatedItems = __spreadArray([], __read(state.tooltip.selected), false);
            if (updatedItems.includes(action.selected)) {
                updatedItems = updatedItems.filter(function (item) { return item !== action.selected; });
            }
            else {
                updatedItems.push(action.selected);
            }
            return __assign(__assign({}, state), { tooltip: __assign(__assign({}, state.tooltip), { selected: updatedItems }) });
        }
        default:
            return state;
    }
}
exports.interactionsReducer = interactionsReducer;
function toggleDeselectedDataSeries(_a, deselectedDataSeries, legendItems) {
    var legendItemIds = _a.legendItemIds, negate = _a.negate;
    var actionSeriesKeys = legendItemIds.map(function (_a) {
        var key = _a.key;
        return key;
    });
    var deselectedDataSeriesKeys = new Set(deselectedDataSeries.map(function (_a) {
        var key = _a.key;
        return key;
    }));
    var legendItemsKeys = legendItems.map(function (_a) {
        var seriesIdentifiers = _a.seriesIdentifiers;
        return seriesIdentifiers;
    });
    var alreadyDeselected = actionSeriesKeys.every(function (key) { return deselectedDataSeriesKeys.has(key); });
    if (negate) {
        return alreadyDeselected || deselectedDataSeries.length !== legendItemsKeys.length - 1
            ? legendItems
                .flatMap(function (_a) {
                var seriesIdentifiers = _a.seriesIdentifiers;
                return seriesIdentifiers;
            })
                .filter(function (_a) {
                var key = _a.key;
                return !actionSeriesKeys.includes(key);
            })
            : legendItemIds;
    }
    else {
        return alreadyDeselected
            ? deselectedDataSeries.filter(function (_a) {
                var key = _a.key;
                return !actionSeriesKeys.includes(key);
            })
            : __spreadArray(__spreadArray([], __read(deselectedDataSeries), false), __read(legendItemIds), false);
    }
}
function getDrilldownData(globalState) {
    if (globalState.chartType !== chart_types_1.ChartType.Partition || !(0, drilldown_active_1.drilldownActive)(globalState)) {
        return [];
    }
    var layerValues = (0, picked_shapes_1.getPickedShapesLayerValues)(globalState)[0];
    return layerValues ? layerValues[layerValues.length - 1].path.map(function (n) { return n.value; }) : [];
}
//# sourceMappingURL=interactions.js.map