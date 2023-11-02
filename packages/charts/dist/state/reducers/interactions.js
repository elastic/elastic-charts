"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionsReducer = void 0;
const get_tooltip_spec_1 = require("./../selectors/get_tooltip_spec");
const chart_types_1 = require("../../chart_types");
const drilldown_active_1 = require("../../chart_types/partition_chart/state/selectors/drilldown_active");
const picked_shapes_1 = require("../../chart_types/partition_chart/state/selectors/picked_shapes");
const point_1 = require("../../utils/point");
const dom_element_1 = require("../actions/dom_element");
const key_1 = require("../actions/key");
const legend_1 = require("../actions/legend");
const mouse_1 = require("../actions/mouse");
const tooltip_1 = require("../actions/tooltip");
const get_internal_is_tooltip_visible_1 = require("../selectors/get_internal_is_tooltip_visible");
const get_internal_tooltip_info_1 = require("../selectors/get_internal_tooltip_info");
const utils_1 = require("../utils");
const DRAG_DETECTION_PIXEL_DELTA = 4;
function interactionsReducer(globalState, action, legendItems) {
    const { interactions: state } = globalState;
    switch (action.type) {
        case key_1.ON_KEY_UP:
            if (action.key === 'Escape') {
                if (state.tooltip.pinned) {
                    return {
                        ...state,
                        pointer: (0, utils_1.getInitialPointerState)(),
                        tooltip: (0, utils_1.getInitialTooltipState)(),
                    };
                }
                return {
                    ...state,
                    pointer: (0, utils_1.getInitialPointerState)(),
                };
            }
            return state;
        case mouse_1.ON_POINTER_MOVE:
            const dragging = state.pointer.dragging ||
                (!!state.pointer.down && (0, point_1.getDelta)(state.pointer.down.position, action.position) > DRAG_DETECTION_PIXEL_DELTA);
            return {
                ...state,
                pointer: {
                    ...state.pointer,
                    dragging,
                    current: {
                        position: {
                            ...action.position,
                        },
                        time: action.time,
                    },
                },
            };
        case mouse_1.ON_MOUSE_DOWN:
            return {
                ...state,
                drilldown: getDrilldownData(globalState),
                prevDrilldown: state.drilldown,
                pointer: {
                    ...state.pointer,
                    dragging: false,
                    up: null,
                    down: {
                        position: {
                            ...action.position,
                        },
                        time: action.time,
                    },
                },
            };
        case mouse_1.ON_MOUSE_UP: {
            return {
                ...state,
                pointer: {
                    ...state.pointer,
                    lastDrag: state.pointer.down && state.pointer.dragging
                        ? {
                            start: {
                                position: {
                                    ...state.pointer.down.position,
                                },
                                time: state.pointer.down.time,
                            },
                            end: {
                                position: {
                                    ...state.pointer.current.position,
                                },
                                time: action.time,
                            },
                        }
                        : null,
                    lastClick: state.pointer.down && !state.pointer.dragging
                        ? {
                            position: {
                                ...action.position,
                            },
                            time: action.time,
                        }
                        : null,
                    dragging: false,
                    down: null,
                    up: {
                        position: {
                            ...action.position,
                        },
                        time: action.time,
                    },
                },
            };
        }
        case legend_1.ON_LEGEND_ITEM_OUT:
            return {
                ...state,
                highlightedLegendPath: [],
            };
        case legend_1.ON_LEGEND_ITEM_OVER:
            const { legendPath: highlightedLegendPath } = action;
            return {
                ...state,
                highlightedLegendPath,
            };
        case legend_1.ON_TOGGLE_DESELECT_SERIES:
            return {
                ...state,
                deselectedDataSeries: toggleDeselectedDataSeries(action, state.deselectedDataSeries, legendItems),
            };
        case dom_element_1.ON_DOM_ELEMENT_ENTER:
            return {
                ...state,
                hoveredDOMElement: action.element,
            };
        case dom_element_1.ON_DOM_ELEMENT_LEAVE:
            return {
                ...state,
                hoveredDOMElement: null,
            };
        case tooltip_1.PIN_TOOLTIP: {
            if (!action.pinned) {
                return {
                    ...state,
                    pointer: action.resetPointer
                        ? (0, utils_1.getInitialPointerState)()
                        : {
                            ...state.pointer,
                            pinned: null,
                        },
                    tooltip: (0, utils_1.getInitialTooltipState)(),
                };
            }
            const { isPinnable, displayOnly } = (0, get_internal_is_tooltip_visible_1.getInternalIsTooltipVisibleSelector)(globalState);
            if (!isPinnable || displayOnly) {
                return state;
            }
            const tooltipSpec = (0, get_tooltip_spec_1.getTooltipSpecSelector)(globalState);
            const getSelectedValues = () => {
                var _a, _b;
                const values = (_b = (_a = (0, get_internal_tooltip_info_1.getInternalTooltipInfoSelector)(globalState)) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : [];
                if (globalState.chartType === chart_types_1.ChartType.Heatmap)
                    return values.slice(0, 1);
                return values.filter((v) => globalState.chartType === chart_types_1.ChartType.XYAxis ? v.isHighlighted : !v.displayOnly);
            };
            const selected = Array.isArray(tooltipSpec.actions) && tooltipSpec.actions.length === 0 ? [] : getSelectedValues();
            return {
                ...state,
                tooltip: {
                    ...state.tooltip,
                    pinned: true,
                    selected,
                },
                pointer: {
                    ...state.pointer,
                    pinned: state.pointer.current,
                },
            };
        }
        case tooltip_1.TOGGLE_SELECTED_TOOLTIP_ITEM: {
            if (!state.tooltip.pinned)
                return state;
            let updatedItems = [...state.tooltip.selected];
            if (updatedItems.includes(action.item)) {
                updatedItems = updatedItems.filter((item) => item !== action.item);
            }
            else {
                updatedItems.push(action.item);
            }
            return {
                ...state,
                tooltip: {
                    ...state.tooltip,
                    selected: updatedItems,
                },
            };
        }
        case tooltip_1.SET_SELECTED_TOOLTIP_ITEMS: {
            if (!state.tooltip.pinned)
                return state;
            return {
                ...state,
                tooltip: {
                    ...state.tooltip,
                    selected: action.items,
                },
            };
        }
        default:
            return state;
    }
}
exports.interactionsReducer = interactionsReducer;
function toggleDeselectedDataSeries({ legendItemIds, negate }, deselectedDataSeries, legendItems) {
    const actionSeriesKeys = legendItemIds.map(({ key }) => key);
    const deselectedDataSeriesKeys = new Set(deselectedDataSeries.map(({ key }) => key));
    const legendItemsKeys = legendItems.map(({ seriesIdentifiers }) => seriesIdentifiers);
    const alreadyDeselected = actionSeriesKeys.every((key) => deselectedDataSeriesKeys.has(key));
    if (negate) {
        return alreadyDeselected || deselectedDataSeries.length !== legendItemsKeys.length - 1
            ? legendItems
                .flatMap(({ seriesIdentifiers }) => seriesIdentifiers)
                .filter(({ key }) => !actionSeriesKeys.includes(key))
            : legendItemIds;
    }
    else {
        return alreadyDeselected
            ? deselectedDataSeries.filter(({ key }) => !actionSeriesKeys.includes(key))
            : [...deselectedDataSeries, ...legendItemIds];
    }
}
function getDrilldownData(globalState) {
    var _a, _b;
    if (globalState.chartType !== chart_types_1.ChartType.Partition || !(0, drilldown_active_1.drilldownActive)(globalState)) {
        return [];
    }
    const layerValues = (0, picked_shapes_1.getPickedShapesLayerValues)(globalState)[0];
    return layerValues ? (_b = (_a = layerValues.at(-1)) === null || _a === void 0 ? void 0 : _a.path.map((n) => n.value)) !== null && _b !== void 0 ? _b : [] : [];
}
//# sourceMappingURL=interactions.js.map