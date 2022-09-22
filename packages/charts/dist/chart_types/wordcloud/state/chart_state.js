"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordcloudState = void 0;
var react_1 = __importDefault(require("react"));
var __1 = require("../..");
var constants_1 = require("../../../common/constants");
var get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
var tooltip_info_1 = require("../../partition_chart/layout/viewmodel/tooltip_info");
var connected_component_1 = require("../renderer/svg/connected_component");
var wordcloud_spec_1 = require("./selectors/wordcloud_spec");
var EMPTY_MAP = new Map();
var EMPTY_LEGEND_LIST = [];
var EMPTY_LEGEND_ITEM_LIST = [];
var WordcloudState = (function () {
    function WordcloudState() {
        this.chartType = __1.ChartType.Wordcloud;
    }
    WordcloudState.prototype.isInitialized = function (globalState) {
        return (0, wordcloud_spec_1.getSpecOrNull)(globalState) !== null ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.ChartNotInitialized;
    };
    WordcloudState.prototype.isBrushAvailable = function () {
        return false;
    };
    WordcloudState.prototype.isBrushing = function () {
        return false;
    };
    WordcloudState.prototype.isChartEmpty = function () {
        return false;
    };
    WordcloudState.prototype.getLegendItems = function () {
        return EMPTY_LEGEND_LIST;
    };
    WordcloudState.prototype.getLegendItemsLabels = function () {
        return EMPTY_LEGEND_ITEM_LIST;
    };
    WordcloudState.prototype.getLegendExtraValues = function () {
        return EMPTY_MAP;
    };
    WordcloudState.prototype.chartRenderer = function () {
        return react_1.default.createElement(connected_component_1.Wordcloud, null);
    };
    WordcloudState.prototype.getPointerCursor = function () {
        return constants_1.DEFAULT_CSS_CURSOR;
    };
    WordcloudState.prototype.isTooltipVisible = function () {
        return {
            visible: false,
            isExternal: false,
            displayOnly: false,
        };
    };
    WordcloudState.prototype.getTooltipInfo = function () {
        return tooltip_info_1.EMPTY_TOOLTIP;
    };
    WordcloudState.prototype.getTooltipAnchor = function (state) {
        var position = state.interactions.pointer.current.position;
        return {
            isRotated: false,
            x: position.x,
            width: 0,
            y: position.y,
            height: 0,
        };
    };
    WordcloudState.prototype.eventCallbacks = function () { };
    WordcloudState.prototype.getChartTypeDescription = function () {
        return 'Word cloud chart';
    };
    WordcloudState.prototype.getProjectionContainerArea = function () {
        return { width: 0, height: 0, top: 0, left: 0 };
    };
    WordcloudState.prototype.getMainProjectionArea = function () {
        return { width: 0, height: 0, top: 0, left: 0 };
    };
    WordcloudState.prototype.getBrushArea = function () {
        return null;
    };
    WordcloudState.prototype.getDebugState = function () {
        return {};
    };
    return WordcloudState;
}());
exports.WordcloudState = WordcloudState;
//# sourceMappingURL=chart_state.js.map