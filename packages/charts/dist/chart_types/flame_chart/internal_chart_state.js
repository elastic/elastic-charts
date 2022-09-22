"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameState = void 0;
var __1 = require("..");
var constants_1 = require("../../common/constants");
var get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
var flame_chart_1 = require("./flame_chart");
var FlameState = (function () {
    function FlameState() {
        this.chartType = __1.ChartType.Flame;
        this.getChartTypeDescription = function () { return 'Flame chart'; };
        this.chartRenderer = flame_chart_1.FlameWithTooltip;
        this.eventCallbacks = function () { };
        this.isInitialized = function () { return get_internal_is_intialized_1.InitStatus.Initialized; };
        this.isBrushAvailable = function () { return false; };
        this.isBrushing = function () { return false; };
        this.isChartEmpty = function () { return false; };
        this.getLegendItemsLabels = function () { return []; };
        this.getLegendItems = function () { return []; };
        this.getLegendExtraValues = function () { return new Map(); };
        this.getPointerCursor = function () { return constants_1.DEFAULT_CSS_CURSOR; };
        this.getTooltipAnchor = function () { return ({ x: 0, y: 0, width: 0, height: 0 }); };
        this.isTooltipVisible = function () { return ({ visible: false, isExternal: false, displayOnly: false }); };
        this.getTooltipInfo = function () { return ({ header: null, values: [] }); };
        this.getProjectionContainerArea = function () { return ({ width: 0, height: 0, top: 0, left: 0 }); };
        this.getMainProjectionArea = function () { return ({ width: 0, height: 0, top: 0, left: 0 }); };
        this.getBrushArea = function () { return null; };
        this.getDebugState = function () { return ({}); };
    }
    return FlameState;
}());
exports.FlameState = FlameState;
//# sourceMappingURL=internal_chart_state.js.map