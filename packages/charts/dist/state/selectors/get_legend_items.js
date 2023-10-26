"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemsSelector = void 0;
const EMPTY_LEGEND_LIST = [];
const getLegendItemsSelector = (state) => {
    if (state.internalChartState) {
        return state.internalChartState.getLegendItems(state);
    }
    return EMPTY_LEGEND_LIST;
};
exports.getLegendItemsSelector = getLegendItemsSelector;
//# sourceMappingURL=get_legend_items.js.map