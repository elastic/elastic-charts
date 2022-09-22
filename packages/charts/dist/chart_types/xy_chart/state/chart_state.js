"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XYAxisChartState = void 0;
var react_1 = __importDefault(require("react"));
var __1 = require("../..");
var brush_1 = require("../../../components/brush/brush");
var tooltip_1 = require("../../../components/tooltip/tooltip");
var get_chart_container_dimensions_1 = require("../../../state/selectors/get_chart_container_dimensions");
var get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
var common_1 = require("../../../utils/common");
var xy_chart_1 = require("../renderer/canvas/xy_chart");
var annotations_1 = require("../renderer/dom/annotations");
var cursor_band_1 = require("../renderer/dom/cursor_band");
var cursor_crossline_1 = require("../renderer/dom/cursor_crossline");
var cursor_line_1 = require("../renderer/dom/cursor_line");
var highlighter_1 = require("../renderer/dom/highlighter");
var compute_chart_dimensions_1 = require("./selectors/compute_chart_dimensions");
var compute_legend_1 = require("./selectors/compute_legend");
var get_brush_area_1 = require("./selectors/get_brush_area");
var get_chart_type_description_1 = require("./selectors/get_chart_type_description");
var get_cursor_pointer_1 = require("./selectors/get_cursor_pointer");
var get_debug_state_1 = require("./selectors/get_debug_state");
var get_highlighted_values_1 = require("./selectors/get_highlighted_values");
var get_legend_items_labels_1 = require("./selectors/get_legend_items_labels");
var get_specs_1 = require("./selectors/get_specs");
var get_tooltip_anchor_position_1 = require("./selectors/get_tooltip_anchor_position");
var get_tooltip_values_highlighted_geoms_1 = require("./selectors/get_tooltip_values_highlighted_geoms");
var is_brush_available_1 = require("./selectors/is_brush_available");
var is_brushing_1 = require("./selectors/is_brushing");
var is_chart_empty_1 = require("./selectors/is_chart_empty");
var is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
var on_brush_end_caller_1 = require("./selectors/on_brush_end_caller");
var on_click_caller_1 = require("./selectors/on_click_caller");
var on_element_out_caller_1 = require("./selectors/on_element_out_caller");
var on_element_over_caller_1 = require("./selectors/on_element_over_caller");
var on_pointer_move_caller_1 = require("./selectors/on_pointer_move_caller");
var on_projection_area_caller_1 = require("./selectors/on_projection_area_caller");
var XYAxisChartState = (function () {
    function XYAxisChartState() {
        this.onClickCaller = (0, on_click_caller_1.createOnClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
        this.onBrushEndCaller = (0, on_brush_end_caller_1.createOnBrushEndCaller)();
        this.onPointerMoveCaller = (0, on_pointer_move_caller_1.createOnPointerMoveCaller)();
        this.onProjectionAreaCaller = (0, on_projection_area_caller_1.createOnProjectionAreaCaller)();
        this.chartType = __1.ChartType.XYAxis;
        this.legendId = (0, common_1.htmlIdGenerator)()('legend');
    }
    XYAxisChartState.prototype.isInitialized = function (globalState) {
        return (0, get_specs_1.getSeriesSpecsSelector)(globalState).length > 0 ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.SpecNotInitialized;
    };
    XYAxisChartState.prototype.isBrushAvailable = function (globalState) {
        return (0, is_brush_available_1.isBrushAvailableSelector)(globalState);
    };
    XYAxisChartState.prototype.isBrushing = function (globalState) {
        return (0, is_brushing_1.isBrushingSelector)(globalState);
    };
    XYAxisChartState.prototype.isChartEmpty = function (globalState) {
        return (0, is_chart_empty_1.isChartEmptySelector)(globalState);
    };
    XYAxisChartState.prototype.getMainProjectionArea = function (globalState) {
        return (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(globalState).chartDimensions;
    };
    XYAxisChartState.prototype.getProjectionContainerArea = function (globalState) {
        return (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(globalState);
    };
    XYAxisChartState.prototype.getBrushArea = function (globalState) {
        return (0, get_brush_area_1.getBrushAreaSelector)(globalState);
    };
    XYAxisChartState.prototype.getLegendItemsLabels = function (globalState) {
        return (0, get_legend_items_labels_1.getLegendItemsLabelsSelector)(globalState);
    };
    XYAxisChartState.prototype.getLegendItems = function (globalState) {
        return (0, compute_legend_1.computeLegendSelector)(globalState);
    };
    XYAxisChartState.prototype.getLegendExtraValues = function (globalState) {
        return (0, get_highlighted_values_1.getHighlightedValuesSelector)(globalState);
    };
    XYAxisChartState.prototype.chartRenderer = function (containerRef, forwardCanvasRef) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(cursor_band_1.CursorBand, null),
            react_1.default.createElement(xy_chart_1.XYChart, { forwardCanvasRef: forwardCanvasRef }),
            react_1.default.createElement(cursor_line_1.CursorLine, null),
            react_1.default.createElement(cursor_crossline_1.CursorCrossLine, null),
            react_1.default.createElement(tooltip_1.Tooltip, { getChartContainerRef: containerRef }),
            react_1.default.createElement(annotations_1.Annotations, { getChartContainerRef: containerRef, chartAreaRef: forwardCanvasRef }),
            react_1.default.createElement(highlighter_1.Highlighter, null),
            react_1.default.createElement(brush_1.BrushTool, null)));
    };
    XYAxisChartState.prototype.getPointerCursor = function (globalState) {
        return (0, get_cursor_pointer_1.getPointerCursorSelector)(globalState);
    };
    XYAxisChartState.prototype.isTooltipVisible = function (globalState) {
        return (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState);
    };
    XYAxisChartState.prototype.getTooltipInfo = function (globalState) {
        return (0, get_tooltip_values_highlighted_geoms_1.getTooltipInfoSelector)(globalState);
    };
    XYAxisChartState.prototype.getTooltipAnchor = function (globalState) {
        return (0, get_tooltip_anchor_position_1.getTooltipAnchorPositionSelector)(globalState);
    };
    XYAxisChartState.prototype.eventCallbacks = function (globalState) {
        this.onElementOverCaller(globalState);
        this.onElementOutCaller(globalState);
        this.onClickCaller(globalState);
        this.onBrushEndCaller(globalState);
        this.onPointerMoveCaller(globalState);
        this.onProjectionAreaCaller(globalState);
    };
    XYAxisChartState.prototype.getDebugState = function (globalState) {
        return (0, get_debug_state_1.getDebugStateSelector)(globalState);
    };
    XYAxisChartState.prototype.getChartTypeDescription = function (globalState) {
        return (0, get_chart_type_description_1.getChartTypeDescriptionSelector)(globalState);
    };
    return XYAxisChartState;
}());
exports.XYAxisChartState = XYAxisChartState;
//# sourceMappingURL=chart_state.js.map