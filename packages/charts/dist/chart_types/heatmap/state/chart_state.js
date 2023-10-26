"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapState = void 0;
const react_1 = __importDefault(require("react"));
const compute_chart_dimensions_1 = require("./selectors/compute_chart_dimensions");
const compute_legend_1 = require("./selectors/compute_legend");
const get_brush_area_1 = require("./selectors/get_brush_area");
const get_cursor_pointer_1 = require("./selectors/get_cursor_pointer");
const get_debug_state_1 = require("./selectors/get_debug_state");
const get_heatmap_table_1 = require("./selectors/get_heatmap_table");
const get_legend_items_labels_1 = require("./selectors/get_legend_items_labels");
const get_tooltip_anchor_1 = require("./selectors/get_tooltip_anchor");
const is_brush_available_1 = require("./selectors/is_brush_available");
const is_empty_1 = require("./selectors/is_empty");
const is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
const on_brush_end_caller_1 = require("./selectors/on_brush_end_caller");
const on_element_click_caller_1 = require("./selectors/on_element_click_caller");
const on_element_out_caller_1 = require("./selectors/on_element_out_caller");
const on_element_over_caller_1 = require("./selectors/on_element_over_caller");
const on_pointer_update_caller_1 = require("./selectors/on_pointer_update_caller");
const tooltip_1 = require("./selectors/tooltip");
const __1 = require("../..");
const brush_1 = require("../../../components/brush/brush");
const tooltip_2 = require("../../../components/tooltip/tooltip");
const get_chart_container_dimensions_1 = require("../../../state/selectors/get_chart_container_dimensions");
const get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
const is_brushing_1 = require("../../../state/selectors/is_brushing");
const connected_component_1 = require("../renderer/canvas/connected_component");
const cursor_band_1 = require("../renderer/dom/cursor_band");
const highlighter_brush_1 = require("../renderer/dom/highlighter_brush");
const EMPTY_MAP = new Map();
class HeatmapState {
    constructor() {
        this.chartType = __1.ChartType.Heatmap;
        this.onElementClickCaller = (0, on_element_click_caller_1.createOnElementClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
        this.onBrushEndCaller = (0, on_brush_end_caller_1.createOnBrushEndCaller)();
        this.onPointerUpdate = (0, on_pointer_update_caller_1.createOnPointerUpdateCaller)();
        this.canDisplayChartTitles = () => true;
    }
    isInitialized() {
        return get_internal_is_intialized_1.InitStatus.Initialized;
    }
    isBrushAvailable(globalState) {
        return (0, is_brush_available_1.isBrushAvailableSelector)(globalState);
    }
    isBrushing(globalState) {
        return (0, is_brushing_1.isBrushingSelector)(globalState);
    }
    isChartEmpty(globalState) {
        return (0, is_empty_1.isEmptySelector)(globalState);
    }
    getLegendItems(globalState) {
        return (0, compute_legend_1.computeLegendSelector)(globalState);
    }
    getLegendItemsLabels(globalState) {
        return (0, get_legend_items_labels_1.getLegendItemsLabelsSelector)(globalState);
    }
    getLegendExtraValues() {
        return EMPTY_MAP;
    }
    chartRenderer(containerRef, forwardStageRef) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(tooltip_2.Tooltip, { getChartContainerRef: containerRef }),
            react_1.default.createElement(connected_component_1.Heatmap, { forwardStageRef: forwardStageRef }),
            react_1.default.createElement(cursor_band_1.CursorBand, null),
            react_1.default.createElement(brush_1.BrushTool, null),
            react_1.default.createElement(highlighter_brush_1.HighlighterFromBrush, null)));
    }
    getPointerCursor(globalState) {
        return (0, get_cursor_pointer_1.getPointerCursorSelector)(globalState);
    }
    isTooltipVisible(globalState) {
        return (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState);
    }
    getTooltipInfo(globalState) {
        return (0, tooltip_1.getTooltipInfoSelector)(globalState);
    }
    getTooltipAnchor(globalState) {
        return (0, get_tooltip_anchor_1.getTooltipAnchorSelector)(globalState);
    }
    getProjectionContainerArea(globalState) {
        return (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(globalState);
    }
    getMainProjectionArea(globalState) {
        return (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(globalState).chartDimensions;
    }
    getBrushArea(globalState) {
        return (0, get_brush_area_1.getBrushAreaSelector)(globalState);
    }
    getDebugState(globalState) {
        return (0, get_debug_state_1.getDebugStateSelector)(globalState);
    }
    getChartTypeDescription() {
        return 'Heatmap chart';
    }
    getSmallMultiplesDomains(globalState) {
        return (0, get_heatmap_table_1.getHeatmapTableSelector)(globalState);
    }
    eventCallbacks(globalState) {
        this.onElementOverCaller(globalState);
        this.onElementOutCaller(globalState);
        this.onElementClickCaller(globalState);
        this.onBrushEndCaller(globalState);
        this.onPointerUpdate(globalState);
    }
}
exports.HeatmapState = HeatmapState;
//# sourceMappingURL=chart_state.js.map