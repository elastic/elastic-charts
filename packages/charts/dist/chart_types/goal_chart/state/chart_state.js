"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalState = void 0;
var react_1 = __importDefault(require("react"));
var __1 = require("../..");
var constants_1 = require("../../../common/constants");
var tooltip_1 = require("../../../components/tooltip/tooltip");
var get_active_pointer_position_1 = require("../../../state/selectors/get_active_pointer_position");
var get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
var connected_component_1 = require("../renderer/canvas/connected_component");
var get_chart_type_description_1 = require("./selectors/get_chart_type_description");
var goal_spec_1 = require("./selectors/goal_spec");
var is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
var on_element_click_caller_1 = require("./selectors/on_element_click_caller");
var on_element_out_caller_1 = require("./selectors/on_element_out_caller");
var on_element_over_caller_1 = require("./selectors/on_element_over_caller");
var tooltip_2 = require("./selectors/tooltip");
var EMPTY_MAP = new Map();
var EMPTY_LEGEND_LIST = [];
var EMPTY_LEGEND_ITEM_LIST = [];
var GoalState = (function () {
    function GoalState() {
        this.chartType = __1.ChartType.Goal;
        this.onElementClickCaller = (0, on_element_click_caller_1.createOnElementClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
    }
    GoalState.prototype.isInitialized = function (globalState) {
        return (0, goal_spec_1.getSpecOrNull)(globalState) !== null ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.ChartNotInitialized;
    };
    GoalState.prototype.isBrushAvailable = function () {
        return false;
    };
    GoalState.prototype.isBrushing = function () {
        return false;
    };
    GoalState.prototype.isChartEmpty = function () {
        return false;
    };
    GoalState.prototype.getLegendItems = function () {
        return EMPTY_LEGEND_LIST;
    };
    GoalState.prototype.getLegendItemsLabels = function () {
        return EMPTY_LEGEND_ITEM_LIST;
    };
    GoalState.prototype.getLegendExtraValues = function () {
        return EMPTY_MAP;
    };
    GoalState.prototype.chartRenderer = function (containerRef, forwardStageRef) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(tooltip_1.Tooltip, { getChartContainerRef: containerRef }),
            react_1.default.createElement(connected_component_1.Goal, { forwardStageRef: forwardStageRef })));
    };
    GoalState.prototype.getPointerCursor = function () {
        return constants_1.DEFAULT_CSS_CURSOR;
    };
    GoalState.prototype.isTooltipVisible = function (globalState) {
        return {
            visible: (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState),
            isExternal: false,
            displayOnly: false,
        };
    };
    GoalState.prototype.getTooltipInfo = function (globalState) {
        return (0, tooltip_2.getTooltipInfoSelector)(globalState);
    };
    GoalState.prototype.getTooltipAnchor = function (state) {
        var position = (0, get_active_pointer_position_1.getActivePointerPosition)(state);
        return {
            isRotated: false,
            x: position.x,
            width: 0,
            y: position.y,
            height: 0,
        };
    };
    GoalState.prototype.eventCallbacks = function (globalState) {
        this.onElementOverCaller(globalState);
        this.onElementOutCaller(globalState);
        this.onElementClickCaller(globalState);
    };
    GoalState.prototype.getChartTypeDescription = function (globalState) {
        return (0, get_chart_type_description_1.getChartTypeDescriptionSelector)(globalState);
    };
    GoalState.prototype.getProjectionContainerArea = function () {
        return { width: 0, height: 0, top: 0, left: 0 };
    };
    GoalState.prototype.getMainProjectionArea = function () {
        return { width: 0, height: 0, top: 0, left: 0 };
    };
    GoalState.prototype.getBrushArea = function () {
        return null;
    };
    GoalState.prototype.getDebugState = function () {
        return {};
    };
    return GoalState;
}());
exports.GoalState = GoalState;
//# sourceMappingURL=chart_state.js.map