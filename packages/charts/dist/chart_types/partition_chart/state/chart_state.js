"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionState = void 0;
const compute_legend_1 = require("./selectors/compute_legend");
const get_chart_type_description_1 = require("./selectors/get_chart_type_description");
const get_cursor_pointer_1 = require("./selectors/get_cursor_pointer");
const get_debug_state_1 = require("./selectors/get_debug_state");
const get_legend_items_extra_1 = require("./selectors/get_legend_items_extra");
const get_legend_items_labels_1 = require("./selectors/get_legend_items_labels");
const is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
const on_element_click_caller_1 = require("./selectors/on_element_click_caller");
const on_element_out_caller_1 = require("./selectors/on_element_out_caller");
const on_element_over_caller_1 = require("./selectors/on_element_over_caller");
const partition_spec_1 = require("./selectors/partition_spec");
const tooltip_1 = require("./selectors/tooltip");
const __1 = require("../..");
const get_active_pointer_position_1 = require("../../../state/selectors/get_active_pointer_position");
const get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
const layered_partition_chart_1 = require("../renderer/dom/layered_partition_chart");
class PartitionState {
    constructor() {
        this.chartType = __1.ChartType.Partition;
        this.canDisplayChartTitles = () => true;
        this.onElementClickCaller = (0, on_element_click_caller_1.createOnElementClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
    }
    isInitialized(globalState) {
        return (0, partition_spec_1.getPartitionSpec)(globalState) !== null ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.SpecNotInitialized;
    }
    isBrushAvailable() {
        return false;
    }
    isBrushing() {
        return false;
    }
    isChartEmpty() {
        return false;
    }
    getLegendItemsLabels(globalState) {
        return (0, get_legend_items_labels_1.getLegendItemsLabels)(globalState);
    }
    getLegendItems(globalState) {
        return (0, compute_legend_1.computeLegendSelector)(globalState);
    }
    getLegendExtraValues(globalState) {
        return (0, get_legend_items_extra_1.getLegendItemsExtra)(globalState);
    }
    chartRenderer(containerRef, forwardStageRef) {
        return (0, layered_partition_chart_1.render)(containerRef, forwardStageRef);
    }
    getPointerCursor(globalState) {
        return (0, get_cursor_pointer_1.getPointerCursorSelector)(globalState);
    }
    isTooltipVisible(globalState) {
        return {
            visible: (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState),
            isExternal: false,
            displayOnly: false,
            isPinnable: true,
        };
    }
    getTooltipInfo(globalState) {
        return (0, tooltip_1.getTooltipInfoSelector)(globalState);
    }
    getTooltipAnchor(state) {
        const position = (0, get_active_pointer_position_1.getActivePointerPosition)(state);
        return {
            isRotated: false,
            x: position.x,
            width: 0,
            y: position.y,
            height: 0,
        };
    }
    eventCallbacks(globalState) {
        this.onElementOverCaller(globalState);
        this.onElementOutCaller(globalState);
        this.onElementClickCaller(globalState);
    }
    getProjectionContainerArea() {
        return { width: 0, height: 0, top: 0, left: 0 };
    }
    getMainProjectionArea() {
        return { width: 0, height: 0, top: 0, left: 0 };
    }
    getBrushArea() {
        return null;
    }
    getDebugState(state) {
        return (0, get_debug_state_1.getDebugStateSelector)(state);
    }
    getChartTypeDescription(state) {
        return (0, get_chart_type_description_1.getChartTypeDescriptionSelector)(state);
    }
    getSmallMultiplesDomains() {
        return {
            smHDomain: [],
            smVDomain: [],
        };
    }
}
exports.PartitionState = PartitionState;
//# sourceMappingURL=chart_state.js.map