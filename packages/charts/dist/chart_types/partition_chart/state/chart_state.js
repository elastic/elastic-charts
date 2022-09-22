"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionState = void 0;
var __1 = require("../..");
var get_active_pointer_position_1 = require("../../../state/selectors/get_active_pointer_position");
var get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
var layered_partition_chart_1 = require("../renderer/dom/layered_partition_chart");
var compute_legend_1 = require("./selectors/compute_legend");
var get_chart_type_description_1 = require("./selectors/get_chart_type_description");
var get_cursor_pointer_1 = require("./selectors/get_cursor_pointer");
var get_debug_state_1 = require("./selectors/get_debug_state");
var get_legend_items_extra_1 = require("./selectors/get_legend_items_extra");
var get_legend_items_labels_1 = require("./selectors/get_legend_items_labels");
var is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
var on_element_click_caller_1 = require("./selectors/on_element_click_caller");
var on_element_out_caller_1 = require("./selectors/on_element_out_caller");
var on_element_over_caller_1 = require("./selectors/on_element_over_caller");
var partition_spec_1 = require("./selectors/partition_spec");
var tooltip_1 = require("./selectors/tooltip");
var PartitionState = (function () {
    function PartitionState() {
        this.chartType = __1.ChartType.Partition;
        this.onElementClickCaller = (0, on_element_click_caller_1.createOnElementClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
    }
    PartitionState.prototype.isInitialized = function (globalState) {
        return (0, partition_spec_1.getPartitionSpec)(globalState) !== null ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.SpecNotInitialized;
    };
    PartitionState.prototype.isBrushAvailable = function () {
        return false;
    };
    PartitionState.prototype.isBrushing = function () {
        return false;
    };
    PartitionState.prototype.isChartEmpty = function () {
        return false;
    };
    PartitionState.prototype.getLegendItemsLabels = function (globalState) {
        return (0, get_legend_items_labels_1.getLegendItemsLabels)(globalState);
    };
    PartitionState.prototype.getLegendItems = function (globalState) {
        return (0, compute_legend_1.computeLegendSelector)(globalState);
    };
    PartitionState.prototype.getLegendExtraValues = function (globalState) {
        return (0, get_legend_items_extra_1.getLegendItemsExtra)(globalState);
    };
    PartitionState.prototype.chartRenderer = function (containerRef, forwardStageRef) {
        return (0, layered_partition_chart_1.render)(containerRef, forwardStageRef);
    };
    PartitionState.prototype.getPointerCursor = function (globalState) {
        return (0, get_cursor_pointer_1.getPointerCursorSelector)(globalState);
    };
    PartitionState.prototype.isTooltipVisible = function (globalState) {
        return {
            visible: (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState),
            isExternal: false,
            displayOnly: false,
        };
    };
    PartitionState.prototype.getTooltipInfo = function (globalState) {
        return (0, tooltip_1.getTooltipInfoSelector)(globalState);
    };
    PartitionState.prototype.getTooltipAnchor = function (state) {
        var position = (0, get_active_pointer_position_1.getActivePointerPosition)(state);
        return {
            isRotated: false,
            x: position.x,
            width: 0,
            y: position.y,
            height: 0,
        };
    };
    PartitionState.prototype.eventCallbacks = function (globalState) {
        this.onElementOverCaller(globalState);
        this.onElementOutCaller(globalState);
        this.onElementClickCaller(globalState);
    };
    PartitionState.prototype.getProjectionContainerArea = function () {
        return { width: 0, height: 0, top: 0, left: 0 };
    };
    PartitionState.prototype.getMainProjectionArea = function () {
        return { width: 0, height: 0, top: 0, left: 0 };
    };
    PartitionState.prototype.getBrushArea = function () {
        return null;
    };
    PartitionState.prototype.getDebugState = function (state) {
        return (0, get_debug_state_1.getDebugStateSelector)(state);
    };
    PartitionState.prototype.getChartTypeDescription = function (state) {
        return (0, get_chart_type_description_1.getChartTypeDescriptionSelector)(state);
    };
    return PartitionState;
}());
exports.PartitionState = PartitionState;
//# sourceMappingURL=chart_state.js.map