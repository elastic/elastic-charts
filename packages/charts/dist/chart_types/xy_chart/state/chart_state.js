"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XYAxisChartState = void 0;
const react_1 = __importDefault(require("react"));
const compute_chart_dimensions_1 = require("./selectors/compute_chart_dimensions");
const compute_legend_1 = require("./selectors/compute_legend");
const compute_series_domains_1 = require("./selectors/compute_series_domains");
const get_brush_area_1 = require("./selectors/get_brush_area");
const get_chart_type_description_1 = require("./selectors/get_chart_type_description");
const get_cursor_pointer_1 = require("./selectors/get_cursor_pointer");
const get_debug_state_1 = require("./selectors/get_debug_state");
const get_legend_item_extra_values_1 = require("./selectors/get_legend_item_extra_values");
const get_legend_items_labels_1 = require("./selectors/get_legend_items_labels");
const get_specs_1 = require("./selectors/get_specs");
const get_tooltip_anchor_position_1 = require("./selectors/get_tooltip_anchor_position");
const get_tooltip_values_highlighted_geoms_1 = require("./selectors/get_tooltip_values_highlighted_geoms");
const is_brush_available_1 = require("./selectors/is_brush_available");
const is_chart_empty_1 = require("./selectors/is_chart_empty");
const is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
const on_brush_end_caller_1 = require("./selectors/on_brush_end_caller");
const on_click_caller_1 = require("./selectors/on_click_caller");
const on_element_out_caller_1 = require("./selectors/on_element_out_caller");
const on_element_over_caller_1 = require("./selectors/on_element_over_caller");
const on_pointer_move_caller_1 = require("./selectors/on_pointer_move_caller");
const on_projection_area_caller_1 = require("./selectors/on_projection_area_caller");
const __1 = require("../..");
const brush_1 = require("../../../components/brush/brush");
const tooltip_1 = require("../../../components/tooltip/tooltip");
const get_chart_container_dimensions_1 = require("../../../state/selectors/get_chart_container_dimensions");
const get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
const is_brushing_1 = require("../../../state/selectors/is_brushing");
const common_1 = require("../../../utils/common");
const xy_chart_1 = require("../renderer/canvas/xy_chart");
const annotations_1 = require("../renderer/dom/annotations");
const cursor_band_1 = require("../renderer/dom/cursor_band");
const cursor_crossline_1 = require("../renderer/dom/cursor_crossline");
const cursor_line_1 = require("../renderer/dom/cursor_line");
const highlighter_1 = require("../renderer/dom/highlighter");
class XYAxisChartState {
    constructor() {
        this.canDisplayChartTitles = () => true;
        this.onClickCaller = (0, on_click_caller_1.createOnClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
        this.onBrushEndCaller = (0, on_brush_end_caller_1.createOnBrushEndCaller)();
        this.onPointerMoveCaller = (0, on_pointer_move_caller_1.createOnPointerMoveCaller)();
        this.onProjectionAreaCaller = (0, on_projection_area_caller_1.createOnProjectionAreaCaller)();
        this.chartType = __1.ChartType.XYAxis;
        this.legendId = (0, common_1.htmlIdGenerator)()('legend');
    }
    isInitialized(globalState) {
        return (0, get_specs_1.getSeriesSpecsSelector)(globalState).length > 0 ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.SpecNotInitialized;
    }
    isBrushAvailable(globalState) {
        return (0, is_brush_available_1.isBrushAvailableSelector)(globalState);
    }
    isBrushing(globalState) {
        return this.isBrushAvailable(globalState) && (0, is_brushing_1.isBrushingSelector)(globalState);
    }
    isChartEmpty(globalState) {
        return (0, is_chart_empty_1.isChartEmptySelector)(globalState);
    }
    getMainProjectionArea(globalState) {
        return (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(globalState).chartDimensions;
    }
    getProjectionContainerArea(globalState) {
        return (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(globalState);
    }
    getBrushArea(globalState) {
        return (0, get_brush_area_1.getBrushAreaSelector)(globalState);
    }
    getLegendItemsLabels(globalState) {
        return (0, get_legend_items_labels_1.getLegendItemsLabelsSelector)(globalState);
    }
    getLegendItems(globalState) {
        return (0, compute_legend_1.computeLegendSelector)(globalState);
    }
    getLegendExtraValues(globalState) {
        return (0, get_legend_item_extra_values_1.getLegendItemExtraValuesSelector)(globalState);
    }
    chartRenderer(containerRef, forwardCanvasRef) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(cursor_band_1.CursorBand, null),
            react_1.default.createElement(xy_chart_1.XYChart, { forwardCanvasRef: forwardCanvasRef }),
            react_1.default.createElement(cursor_line_1.CursorLine, null),
            react_1.default.createElement(cursor_crossline_1.CursorCrossLine, null),
            react_1.default.createElement(tooltip_1.Tooltip, { getChartContainerRef: containerRef }),
            react_1.default.createElement(annotations_1.Annotations, { getChartContainerRef: containerRef, chartAreaRef: forwardCanvasRef }),
            react_1.default.createElement(highlighter_1.Highlighter, null),
            react_1.default.createElement(brush_1.BrushTool, null)));
    }
    getPointerCursor(globalState) {
        return (0, get_cursor_pointer_1.getPointerCursorSelector)(globalState);
    }
    isTooltipVisible(globalState) {
        return (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState);
    }
    getTooltipInfo(globalState) {
        return (0, get_tooltip_values_highlighted_geoms_1.getTooltipInfoSelector)(globalState);
    }
    getTooltipAnchor(globalState) {
        return (0, get_tooltip_anchor_position_1.getTooltipAnchorPositionSelector)(globalState);
    }
    getSmallMultiplesDomains(globalState) {
        return (0, compute_series_domains_1.computeSeriesDomainsSelector)(globalState);
    }
    eventCallbacks(globalState) {
        this.onElementOverCaller(globalState);
        this.onElementOutCaller(globalState);
        this.onClickCaller(globalState);
        this.onBrushEndCaller(globalState);
        this.onPointerMoveCaller(globalState);
        this.onProjectionAreaCaller(globalState);
    }
    getDebugState(globalState) {
        return (0, get_debug_state_1.getDebugStateSelector)(globalState);
    }
    getChartTypeDescription(globalState) {
        return (0, get_chart_type_description_1.getChartTypeDescriptionSelector)(globalState);
    }
}
exports.XYAxisChartState = XYAxisChartState;
//# sourceMappingURL=chart_state.js.map