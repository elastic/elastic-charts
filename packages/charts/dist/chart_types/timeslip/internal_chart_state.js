"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeslipState = void 0;
const timeslip_chart_1 = require("./timeslip_chart");
const __1 = require("..");
const constants_1 = require("../../common/constants");
const get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
class TimeslipState {
    constructor() {
        this.chartType = __1.ChartType.Timeslip;
        this.getChartTypeDescription = () => 'Timeslip chart';
        this.chartRenderer = timeslip_chart_1.TimeslipWithTooltip;
        this.eventCallbacks = () => { };
        this.isInitialized = () => get_internal_is_intialized_1.InitStatus.Initialized;
        this.isBrushAvailable = () => false;
        this.isBrushing = () => false;
        this.isChartEmpty = () => false;
        this.getLegendItemsLabels = () => [];
        this.getLegendItems = () => [];
        this.getLegendExtraValues = () => new Map();
        this.getPointerCursor = () => constants_1.DEFAULT_CSS_CURSOR;
        this.getTooltipAnchor = () => ({ x: 0, y: 0, width: 0, height: 0 });
        this.isTooltipVisible = () => ({
            visible: false,
            isExternal: false,
            displayOnly: false,
            isPinnable: false,
        });
        this.getTooltipInfo = () => ({ header: null, values: [] });
        this.getProjectionContainerArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
        this.getMainProjectionArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
        this.getBrushArea = () => null;
        this.getDebugState = () => ({});
        this.canDisplayChartTitles = () => true;
    }
    getSmallMultiplesDomains() {
        return {
            smHDomain: [],
            smVDomain: [],
        };
    }
}
exports.TimeslipState = TimeslipState;
//# sourceMappingURL=internal_chart_state.js.map