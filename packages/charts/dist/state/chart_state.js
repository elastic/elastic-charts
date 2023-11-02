"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartStoreReducer = exports.getInitialState = void 0;
const chart_1 = require("./actions/chart");
const chart_settings_1 = require("./actions/chart_settings");
const colors_1 = require("./actions/colors");
const events_1 = require("./actions/events");
const specs_1 = require("./actions/specs");
const z_index_1 = require("./actions/z_index");
const interactions_1 = require("./reducers/interactions");
const get_internal_is_intialized_1 = require("./selectors/get_internal_is_intialized");
const get_legend_items_1 = require("./selectors/get_legend_items");
const utils_1 = require("./utils");
const chart_types_1 = require("../chart_types");
const internal_chart_state_1 = require("../chart_types/flame_chart/internal_chart_state");
const chart_state_1 = require("../chart_types/goal_chart/state/chart_state");
const chart_state_2 = require("../chart_types/heatmap/state/chart_state");
const chart_state_3 = require("../chart_types/metric/state/chart_state");
const chart_state_4 = require("../chart_types/partition_chart/state/chart_state");
const internal_chart_state_2 = require("../chart_types/timeslip/internal_chart_state");
const chart_state_5 = require("../chart_types/wordcloud/state/chart_state");
const chart_state_6 = require("../chart_types/xy_chart/state/chart_state");
const specs_2 = require("../specs");
const common_1 = require("../utils/common");
const logger_1 = require("../utils/logger");
const getInitialState = (chartId, title, description) => ({
    chartId,
    title,
    description,
    zIndex: 0,
    specsInitialized: false,
    specParsing: false,
    chartRendered: false,
    chartRenderedCount: 0,
    specs: {
        [specs_2.DEFAULT_SETTINGS_SPEC.id]: specs_2.DEFAULT_SETTINGS_SPEC,
    },
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
exports.getInitialState = getInitialState;
const chartStoreReducer = (chartId, title, description) => {
    return (state = (0, exports.getInitialState)(chartId, title, description), action) => {
        switch (action.type) {
            case z_index_1.Z_INDEX_EVENT:
                return {
                    ...state,
                    zIndex: action.zIndex,
                };
            case specs_1.SPEC_PARSED:
                const chartType = chartTypeFromSpecs(state.specs);
                return {
                    ...state,
                    specsInitialized: true,
                    specParsing: false,
                    chartType,
                    internalChartState: state.chartType === chartType ? state.internalChartState : newInternalState(chartType),
                };
            case specs_1.SPEC_UNMOUNTED:
                return {
                    ...state,
                    specsInitialized: false,
                    chartRendered: false,
                };
            case specs_1.UPSERT_SPEC:
                return {
                    ...state,
                    specsInitialized: false,
                    chartRendered: false,
                    specParsing: true,
                    specs: state.specParsing
                        ? { ...state.specs, [action.spec.id]: action.spec }
                        : { [specs_2.DEFAULT_SETTINGS_SPEC.id]: specs_2.DEFAULT_SETTINGS_SPEC, [action.spec.id]: action.spec },
                };
            case specs_1.REMOVE_SPEC:
                const { [action.id]: specToRemove, ...rest } = state.specs;
                return {
                    ...state,
                    specsInitialized: false,
                    chartRendered: false,
                    specParsing: false,
                    specs: {
                        ...rest,
                    },
                };
            case chart_1.CHART_RENDERED:
                const chartRenderedCount = state.chartRendered ? state.chartRenderedCount : state.chartRenderedCount + 1;
                return {
                    ...state,
                    chartRendered: true,
                    chartRenderedCount,
                };
            case chart_settings_1.UPDATE_PARENT_DIMENSION:
                return {
                    ...state,
                    interactions: {
                        ...state.interactions,
                        prevDrilldown: state.interactions.drilldown,
                        tooltip: (0, utils_1.getInitialTooltipState)(),
                        pointer: {
                            ...state.interactions.pointer,
                            pinned: null,
                        },
                    },
                    parentDimensions: {
                        ...action.dimensions,
                    },
                    chartRendered: false,
                };
            case chart_settings_1.UPDATE_CHART_TITLES:
                return {
                    ...state,
                    title: action.title,
                    description: action.description,
                };
            case events_1.EXTERNAL_POINTER_EVENT:
                return {
                    ...state,
                    externalEvents: {
                        ...state.externalEvents,
                        pointer: action.event.chartId === chartId ? null : action.event,
                    },
                    ...(action.event.chartId !== chartId && {
                        interactions: {
                            ...state.interactions,
                            pointer: (0, utils_1.getInitialPointerState)(),
                            tooltip: (0, utils_1.getInitialTooltipState)(),
                        },
                    }),
                };
            case colors_1.CLEAR_TEMPORARY_COLORS:
                return {
                    ...state,
                    colors: {
                        ...state.colors,
                        temporary: {},
                    },
                };
            case colors_1.SET_TEMPORARY_COLOR:
                return {
                    ...state,
                    colors: {
                        ...state.colors,
                        temporary: {
                            ...state.colors.temporary,
                            ...action.keys.reduce((acc, curr) => {
                                acc[curr] = action.color;
                                return acc;
                            }, {}),
                        },
                    },
                };
            case colors_1.SET_PERSISTED_COLOR:
                const persisted = action.keys.reduce((acc, curr) => {
                    if (action.color) {
                        acc[curr] = action.color;
                    }
                    else {
                        delete acc[curr];
                    }
                    return acc;
                }, state.colors.persisted);
                return {
                    ...state,
                    colors: {
                        ...state.colors,
                        persisted,
                    },
                };
            default:
                return (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) === get_internal_is_intialized_1.InitStatus.Initialized
                    ? {
                        ...state,
                        interactions: (0, interactions_1.interactionsReducer)(state, action, (0, get_legend_items_1.getLegendItemsSelector)(state)),
                    }
                    : state;
        }
    };
};
exports.chartStoreReducer = chartStoreReducer;
function chartTypeFromSpecs(specs) {
    const nonGlobalTypes = Object.values(specs)
        .map((s) => s.chartType)
        .filter((type) => type !== chart_types_1.ChartType.Global)
        .filter(common_1.keepDistinct);
    if (!nonGlobalTypes[0]) {
        logger_1.Logger.warn(`${nonGlobalTypes.length === 0 ? 'Zero' : 'Multiple'} chart types in the same configuration`);
        return null;
    }
    return nonGlobalTypes[0];
}
const constructors = {
    [chart_types_1.ChartType.Goal]: () => new chart_state_1.GoalState(),
    [chart_types_1.ChartType.Partition]: () => new chart_state_4.PartitionState(),
    [chart_types_1.ChartType.Flame]: () => new internal_chart_state_1.FlameState(),
    [chart_types_1.ChartType.Timeslip]: () => new internal_chart_state_2.TimeslipState(),
    [chart_types_1.ChartType.XYAxis]: () => new chart_state_6.XYAxisChartState(),
    [chart_types_1.ChartType.Heatmap]: () => new chart_state_2.HeatmapState(),
    [chart_types_1.ChartType.Wordcloud]: () => new chart_state_5.WordcloudState(),
    [chart_types_1.ChartType.Metric]: () => new chart_state_3.MetricState(),
    [chart_types_1.ChartType.Global]: () => null,
};
function newInternalState(chartType) {
    return chartType ? constructors[chartType]() : null;
}
//# sourceMappingURL=chart_state.js.map