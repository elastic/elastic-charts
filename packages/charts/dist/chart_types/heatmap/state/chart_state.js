"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapState = void 0;
var react_1 = __importDefault(require("react"));
var __1 = require("../..");
var brush_1 = require("../../../components/brush/brush");
var tooltip_1 = require("../../../components/tooltip/tooltip");
var get_chart_container_dimensions_1 = require("../../../state/selectors/get_chart_container_dimensions");
var get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
var connected_component_1 = require("../renderer/canvas/connected_component");
var cursor_band_1 = require("../renderer/dom/cursor_band");
var highlighter_brush_1 = require("../renderer/dom/highlighter_brush");
var compute_chart_dimensions_1 = require("./selectors/compute_chart_dimensions");
var compute_legend_1 = require("./selectors/compute_legend");
var get_brush_area_1 = require("./selectors/get_brush_area");
var get_cursor_pointer_1 = require("./selectors/get_cursor_pointer");
var get_debug_state_1 = require("./selectors/get_debug_state");
var get_legend_items_labels_1 = require("./selectors/get_legend_items_labels");
var get_tooltip_anchor_1 = require("./selectors/get_tooltip_anchor");
var heatmap_spec_1 = require("./selectors/heatmap_spec");
var is_brush_available_1 = require("./selectors/is_brush_available");
var is_brushing_1 = require("./selectors/is_brushing");
var is_empty_1 = require("./selectors/is_empty");
var is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
var on_brush_end_caller_1 = require("./selectors/on_brush_end_caller");
var on_element_click_caller_1 = require("./selectors/on_element_click_caller");
var on_element_out_caller_1 = require("./selectors/on_element_out_caller");
var on_element_over_caller_1 = require("./selectors/on_element_over_caller");
var on_pointer_update_caller_1 = require("./selectors/on_pointer_update_caller");
var tooltip_2 = require("./selectors/tooltip");
var EMPTY_MAP = new Map();
var HeatmapState = (function () {
    function HeatmapState() {
        this.chartType = __1.ChartType.Heatmap;
        this.onElementClickCaller = (0, on_element_click_caller_1.createOnElementClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
        this.onBrushEndCaller = (0, on_brush_end_caller_1.createOnBrushEndCaller)();
        this.onPointerUpdate = (0, on_pointer_update_caller_1.createOnPointerUpdateCaller)();
    }
    HeatmapState.prototype.isInitialized = function (globalState) {
        return (0, heatmap_spec_1.getSpecOrNull)(globalState) !== null ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.ChartNotInitialized;
    };
    HeatmapState.prototype.isBrushAvailable = function (globalState) {
        return (0, is_brush_available_1.isBrushAvailableSelector)(globalState);
    };
    HeatmapState.prototype.isBrushing = function (globalState) {
        return (0, is_brushing_1.isBrushingSelector)(globalState);
    };
    HeatmapState.prototype.isChartEmpty = function (globalState) {
        return (0, is_empty_1.isEmptySelector)(globalState);
    };
    HeatmapState.prototype.getLegendItems = function (globalState) {
        return (0, compute_legend_1.computeLegendSelector)(globalState);
    };
    HeatmapState.prototype.getLegendItemsLabels = function (globalState) {
        return (0, get_legend_items_labels_1.getLegendItemsLabelsSelector)(globalState);
    };
    HeatmapState.prototype.getLegendExtraValues = function () {
        return EMPTY_MAP;
    };
    HeatmapState.prototype.chartRenderer = function (containerRef, forwardStageRef) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(tooltip_1.Tooltip, { getChartContainerRef: containerRef }),
            react_1.default.createElement(connected_component_1.Heatmap, { forwardStageRef: forwardStageRef }),
            react_1.default.createElement(cursor_band_1.CursorBand, null),
            react_1.default.createElement(brush_1.BrushTool, null),
            react_1.default.createElement(highlighter_brush_1.HighlighterFromBrush, null)));
    };
    HeatmapState.prototype.getPointerCursor = function (globalState) {
        return (0, get_cursor_pointer_1.getPointerCursorSelector)(globalState);
    };
    HeatmapState.prototype.isTooltipVisible = function (globalState) {
        return (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState);
    };
    HeatmapState.prototype.getTooltipInfo = function (globalState) {
        return (0, tooltip_2.getTooltipInfoSelector)(globalState);
    };
    HeatmapState.prototype.getTooltipAnchor = function (globalState) {
        return (0, get_tooltip_anchor_1.getTooltipAnchorSelector)(globalState);
    };
    HeatmapState.prototype.getProjectionContainerArea = function (globalState) {
        return (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(globalState);
    };
    HeatmapState.prototype.getMainProjectionArea = function (globalState) {
        return (0, compute_chart_dimensions_1.computeChartElementSizesSelector)(globalState).grid;
    };
    HeatmapState.prototype.getBrushArea = function (globalState) {
        return (0, get_brush_area_1.getBrushAreaSelector)(globalState);
    };
    HeatmapState.prototype.getDebugState = function (globalState) {
        return (0, get_debug_state_1.getDebugStateSelector)(globalState);
    };
    HeatmapState.prototype.getChartTypeDescription = function () {
        return 'Heatmap chart';
    };
    HeatmapState.prototype.eventCallbacks = function (globalState) {
        this.onElementOverCaller(globalState);
        this.onElementOutCaller(globalState);
        this.onElementClickCaller(globalState);
        this.onBrushEndCaller(globalState);
        this.onPointerUpdate(globalState);
    };
    return HeatmapState;
}());
exports.HeatmapState = HeatmapState;
//# sourceMappingURL=chart_state.js.map