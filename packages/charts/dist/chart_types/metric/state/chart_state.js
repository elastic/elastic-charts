"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricState = void 0;
var react_1 = __importDefault(require("react"));
var __1 = require("../..");
var constants_1 = require("../../../common/constants");
var get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
var dom_1 = require("../renderer/dom");
var EMPTY_MAP = new Map();
var EMPTY_LEGEND_LIST = [];
var EMPTY_LEGEND_ITEM_LIST = [];
var MetricState = (function () {
    function MetricState() {
        this.chartType = __1.ChartType.Metric;
        this.getChartTypeDescription = function () { return 'Metric chart'; };
        this.chartRenderer = function () { return react_1.default.createElement(dom_1.Metric, null); };
        this.isInitialized = function () { return get_internal_is_intialized_1.InitStatus.Initialized; };
        this.isBrushAvailable = function () { return false; };
        this.isBrushing = function () { return false; };
        this.isChartEmpty = function () { return false; };
        this.getLegendItems = function () { return EMPTY_LEGEND_LIST; };
        this.getLegendItemsLabels = function () { return EMPTY_LEGEND_ITEM_LIST; };
        this.getLegendExtraValues = function () { return EMPTY_MAP; };
        this.getPointerCursor = function () { return constants_1.DEFAULT_CSS_CURSOR; };
        this.isTooltipVisible = function () { return ({
            visible: false,
            isExternal: false,
            displayOnly: false,
        }); };
        this.getTooltipInfo = function () { return undefined; };
        this.getTooltipAnchor = function () { return null; };
        this.eventCallbacks = function () { };
        this.getProjectionContainerArea = function () { return ({ width: 0, height: 0, top: 0, left: 0 }); };
        this.getMainProjectionArea = function () { return ({ width: 0, height: 0, top: 0, left: 0 }); };
        this.getBrushArea = function () { return null; };
        this.getDebugState = function () { return ({}); };
    }
    return MetricState;
}());
exports.MetricState = MetricState;
//# sourceMappingURL=chart_state.js.map