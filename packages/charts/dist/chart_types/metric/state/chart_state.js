"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricState = void 0;
const react_1 = __importDefault(require("react"));
const can_display_chart_titles_1 = require("./selectors/can_display_chart_titles");
const __1 = require("../..");
const constants_1 = require("../../../common/constants");
const get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
const dom_1 = require("../renderer/dom");
const EMPTY_MAP = new Map();
const EMPTY_LEGEND_LIST = [];
const EMPTY_LEGEND_ITEM_LIST = [];
class MetricState {
    constructor() {
        this.chartType = __1.ChartType.Metric;
        this.getChartTypeDescription = () => 'Metric chart';
        this.chartRenderer = () => react_1.default.createElement(dom_1.Metric, null);
        this.isInitialized = () => get_internal_is_intialized_1.InitStatus.Initialized;
        this.isBrushAvailable = () => false;
        this.isBrushing = () => false;
        this.isChartEmpty = () => false;
        this.getLegendItems = () => EMPTY_LEGEND_LIST;
        this.getLegendItemsLabels = () => EMPTY_LEGEND_ITEM_LIST;
        this.getLegendExtraValues = () => EMPTY_MAP;
        this.getPointerCursor = () => constants_1.DEFAULT_CSS_CURSOR;
        this.isTooltipVisible = () => ({
            visible: false,
            isExternal: false,
            displayOnly: false,
            isPinnable: false,
        });
        this.getTooltipInfo = () => undefined;
        this.getTooltipAnchor = () => null;
        this.eventCallbacks = () => { };
        this.getProjectionContainerArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
        this.getMainProjectionArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
        this.getBrushArea = () => null;
        this.getDebugState = () => ({});
    }
    getSmallMultiplesDomains() {
        return {
            smHDomain: [],
            smVDomain: [],
        };
    }
    canDisplayChartTitles(globalState) {
        return (0, can_display_chart_titles_1.canDisplayChartTitles)(globalState);
    }
}
exports.MetricState = MetricState;
//# sourceMappingURL=chart_state.js.map