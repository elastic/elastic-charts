"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordcloudState = void 0;
const react_1 = __importDefault(require("react"));
const wordcloud_spec_1 = require("./selectors/wordcloud_spec");
const __1 = require("../..");
const constants_1 = require("../../../common/constants");
const get_internal_is_intialized_1 = require("../../../state/selectors/get_internal_is_intialized");
const connected_component_1 = require("../renderer/svg/connected_component");
const EMPTY_MAP = new Map();
const EMPTY_LEGEND_LIST = [];
const EMPTY_LEGEND_ITEM_LIST = [];
const EMPTY_TOOLTIP = Object.freeze({ header: null, values: [] });
class WordcloudState {
    constructor() {
        this.chartType = __1.ChartType.Wordcloud;
        this.canDisplayChartTitles = () => true;
    }
    isInitialized(globalState) {
        return (0, wordcloud_spec_1.getWordcloudSpecSelector)(globalState) !== null ? get_internal_is_intialized_1.InitStatus.Initialized : get_internal_is_intialized_1.InitStatus.ChartNotInitialized;
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
    chartRenderer() {
        return react_1.default.createElement(connected_component_1.Wordcloud, null);
    }
    getPointerCursor() {
        return constants_1.DEFAULT_CSS_CURSOR;
    }
    isTooltipVisible() {
        return {
            visible: false,
            isExternal: false,
            displayOnly: false,
            isPinnable: false,
        };
    }
    getTooltipInfo() {
        return EMPTY_TOOLTIP;
    }
    getTooltipAnchor(state) {
        const { position } = state.interactions.pointer.current;
        return {
            isRotated: false,
            x: position.x,
            width: 0,
            y: position.y,
            height: 0,
        };
    }
    eventCallbacks() { }
    getChartTypeDescription() {
        return 'Word cloud chart';
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
exports.WordcloudState = WordcloudState;
//# sourceMappingURL=chart_state.js.map