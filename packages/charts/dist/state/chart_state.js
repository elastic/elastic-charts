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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartStoreReducer = exports.getInitialState = void 0;
var chart_types_1 = require("../chart_types");
var internal_chart_state_1 = require("../chart_types/flame_chart/internal_chart_state");
var chart_state_1 = require("../chart_types/goal_chart/state/chart_state");
var chart_state_2 = require("../chart_types/heatmap/state/chart_state");
var chart_state_3 = require("../chart_types/metric/state/chart_state");
var chart_state_4 = require("../chart_types/partition_chart/state/chart_state");
var internal_chart_state_2 = require("../chart_types/timeslip/internal_chart_state");
var chart_state_5 = require("../chart_types/wordcloud/state/chart_state");
var chart_state_6 = require("../chart_types/xy_chart/state/chart_state");
var specs_1 = require("../specs");
var common_1 = require("../utils/common");
var logger_1 = require("../utils/logger");
var chart_1 = require("./actions/chart");
var chart_settings_1 = require("./actions/chart_settings");
var colors_1 = require("./actions/colors");
var events_1 = require("./actions/events");
var specs_2 = require("./actions/specs");
var z_index_1 = require("./actions/z_index");
var interactions_1 = require("./reducers/interactions");
var get_internal_is_intialized_1 = require("./selectors/get_internal_is_intialized");
var get_legend_items_1 = require("./selectors/get_legend_items");
var utils_1 = require("./utils");
var getInitialState = function (chartId) {
    var _a;
    return ({
        chartId: chartId,
        zIndex: 0,
        specsInitialized: false,
        specParsing: false,
        chartRendered: false,
        chartRenderedCount: 0,
        specs: (_a = {},
            _a[specs_1.DEFAULT_SETTINGS_SPEC.id] = specs_1.DEFAULT_SETTINGS_SPEC,
            _a),
        colors: {
            temporary: {},
            persisted: {},
        },
        chartType: null,
        internalChartState: null,
        interactions: {
            pointer: (0, utils_1.getInitialPointerState)(),
            highlightedLegendPath: [],
            deselectedDataSeries: [],
            hoveredDOMElement: null,
            drilldown: [],
            prevDrilldown: [],
            tooltip: (0, utils_1.getInitialTooltipState)(),
        },
        externalEvents: {
            pointer: null,
        },
        parentDimensions: {
            height: 0,
            width: 0,
            left: 0,
            top: 0,
        },
    });
};
exports.getInitialState = getInitialState;
var chartStoreReducer = function (chartId) {
    return function (state, action) {
        var _a, _b;
        if (state === void 0) { state = (0, exports.getInitialState)(chartId); }
        switch (action.type) {
            case z_index_1.Z_INDEX_EVENT:
                return __assign(__assign({}, state), { zIndex: action.zIndex });
            case specs_2.SPEC_PARSED:
                var chartType = chartTypeFromSpecs(state.specs);
                return __assign(__assign({}, state), { specsInitialized: true, specParsing: false, chartType: chartType, internalChartState: state.chartType === chartType ? state.internalChartState : newInternalState(chartType) });
            case specs_2.SPEC_UNMOUNTED:
                return __assign(__assign({}, state), { specsInitialized: false, chartRendered: false });
            case specs_2.UPSERT_SPEC:
                return __assign(__assign({}, state), { specsInitialized: false, chartRendered: false, specParsing: true, specs: state.specParsing
                        ? __assign(__assign({}, state.specs), (_a = {}, _a[action.spec.id] = action.spec, _a)) : (_b = {}, _b[specs_1.DEFAULT_SETTINGS_SPEC.id] = specs_1.DEFAULT_SETTINGS_SPEC, _b[action.spec.id] = action.spec, _b) });
            case specs_2.REMOVE_SPEC:
                var _c = state.specs, _d = action.id, specToRemove = _c[_d], rest = __rest(_c, [typeof _d === "symbol" ? _d : _d + ""]);
                return __assign(__assign({}, state), { specsInitialized: false, chartRendered: false, specParsing: false, specs: __assign({}, rest) });
            case chart_1.CHART_RENDERED:
                var count = state.chartRendered ? state.chartRenderedCount : state.chartRenderedCount + 1;
                return __assign(__assign({}, state), { chartRendered: true, chartRenderedCount: count });
            case chart_settings_1.UPDATE_PARENT_DIMENSION:
                return __assign(__assign({}, state), { interactions: __assign(__assign({}, state.interactions), { prevDrilldown: state.interactions.drilldown, tooltip: (0, utils_1.getInitialTooltipState)(), pointer: __assign(__assign({}, state.interactions.pointer), { pinned: null }) }), parentDimensions: __assign({}, action.dimensions) });
            case events_1.EXTERNAL_POINTER_EVENT:
                return __assign(__assign({}, state), { externalEvents: __assign(__assign({}, state.externalEvents), { pointer: action.event.chartId === chartId ? null : action.event }) });
            case colors_1.CLEAR_TEMPORARY_COLORS:
                return __assign(__assign({}, state), { colors: __assign(__assign({}, state.colors), { temporary: {} }) });
            case colors_1.SET_TEMPORARY_COLOR:
                return __assign(__assign({}, state), { colors: __assign(__assign({}, state.colors), { temporary: __assign(__assign({}, state.colors.temporary), action.keys.reduce(function (acc, curr) {
                            acc[curr] = action.color;
                            return acc;
                        }, {})) }) });
            case colors_1.SET_PERSISTED_COLOR:
                var persisted = action.keys.reduce(function (acc, curr) {
                    if (action.color) {
                        acc[curr] = action.color;
                    }
                    else {
                        delete acc[curr];
                    }
                    return acc;
                }, state.colors.persisted);
                return __assign(__assign({}, state), { colors: __assign(__assign({}, state.colors), { persisted: persisted }) });
            default:
                return (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) === get_internal_is_intialized_1.InitStatus.Initialized
                    ? __assign(__assign({}, state), { interactions: (0, interactions_1.interactionsReducer)(state, action, (0, get_legend_items_1.getLegendItemsSelector)(state)) }) : state;
        }
    };
};
exports.chartStoreReducer = chartStoreReducer;
function chartTypeFromSpecs(specs) {
    var nonGlobalTypes = Object.values(specs)
        .map(function (s) { return s.chartType; })
        .filter(function (type) { return type !== chart_types_1.ChartType.Global; })
        .filter(common_1.keepDistinct);
    if (nonGlobalTypes.length !== 1) {
        logger_1.Logger.warn("".concat(nonGlobalTypes.length === 0 ? 'Zero' : 'Multiple', " chart types in the same configuration"));
        return null;
    }
    return nonGlobalTypes[0];
}
var constructors = (_a = {},
    _a[chart_types_1.ChartType.Goal] = function () { return new chart_state_1.GoalState(); },
    _a[chart_types_1.ChartType.Partition] = function () { return new chart_state_4.PartitionState(); },
    _a[chart_types_1.ChartType.Flame] = function () { return new internal_chart_state_1.FlameState(); },
    _a[chart_types_1.ChartType.Timeslip] = function () { return new internal_chart_state_2.TimeslipState(); },
    _a[chart_types_1.ChartType.XYAxis] = function () { return new chart_state_6.XYAxisChartState(); },
    _a[chart_types_1.ChartType.Heatmap] = function () { return new chart_state_2.HeatmapState(); },
    _a[chart_types_1.ChartType.Wordcloud] = function () { return new chart_state_5.WordcloudState(); },
    _a[chart_types_1.ChartType.Metric] = function () { return new chart_state_3.MetricState(); },
    _a[chart_types_1.ChartType.Global] = function () { return null; },
    _a);
function newInternalState(chartType) {
    return chartType ? constructors[chartType]() : null;
}
//# sourceMappingURL=chart_state.js.map