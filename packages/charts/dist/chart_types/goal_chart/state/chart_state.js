"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalState = void 0;
const react_1 = __importDefault(require("react"));
const get_chart_type_description_1 = require("./selectors/get_chart_type_description");
const get_goal_spec_1 = require("./selectors/get_goal_spec");
const is_tooltip_visible_1 = require("./selectors/is_tooltip_visible");
const on_element_click_caller_1 = require("./selectors/on_element_click_caller");
const on_element_out_caller_1 = require("./selectors/on_element_out_caller");
const on_element_over_caller_1 = require("./selectors/on_element_over_caller");
const tooltip_1 = require("./selectors/tooltip");
const __1 = require("../..");
const constants_1 = require("../../../common/constants");
const tooltip_2 = require("../../../components/tooltip/tooltip");
const get_active_pointer_position_1 = require("../../../state/selectors/get_active_pointer_position");
const get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
const connected_component_1 = require("../renderer/canvas/connected_component");
const EMPTY_MAP = new Map();
const EMPTY_LEGEND_LIST = [];
const EMPTY_LEGEND_ITEM_LIST = [];
class GoalState {
    constructor() {
        this.chartType = __1.ChartType.Goal;
        this.canDisplayChartTitles = () => false;
        this.onElementClickCaller = (0, on_element_click_caller_1.createOnElementClickCaller)();
        this.onElementOverCaller = (0, on_element_over_caller_1.createOnElementOverCaller)();
        this.onElementOutCaller = (0, on_element_out_caller_1.createOnElementOutCaller)();
    }
    isInitialized(globalState) {
        return (0, get_goal_spec_1.getGoalSpecSelector)(globalState) !== null ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.ChartNotInitialized;
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
    getLegendItems() {
        return EMPTY_LEGEND_LIST;
    }
    getLegendItemsLabels() {
        return EMPTY_LEGEND_ITEM_LIST;
    }
    getLegendExtraValues() {
        return EMPTY_MAP;
    }
    chartRenderer(containerRef, forwardStageRef) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(tooltip_2.Tooltip, { getChartContainerRef: containerRef }),
            react_1.default.createElement(connected_component_1.Goal, { forwardStageRef: forwardStageRef })));
    }
    getPointerCursor() {
        return constants_1.DEFAULT_CSS_CURSOR;
    }
    isTooltipVisible(globalState) {
        return {
            visible: (0, is_tooltip_visible_1.isTooltipVisibleSelector)(globalState),
            isExternal: false,
            displayOnly: false,
            isPinnable: false,
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
    getChartTypeDescription(globalState) {
        return (0, get_chart_type_description_1.getChartTypeDescriptionSelector)(globalState);
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
    getDebugState() {
        return {};
    }
    getSmallMultiplesDomains() {
        return {
            smHDomain: [],
            smVDomain: [],
        };
    }
}
exports.GoalState = GoalState;
//# sourceMappingURL=chart_state.js.map