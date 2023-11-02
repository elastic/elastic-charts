"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onToggleDeselectSeriesAction = exports.onLegendItemOutAction = exports.onLegendItemOverAction = exports.ON_TOGGLE_DESELECT_SERIES = exports.ON_LEGEND_ITEM_OUT = exports.ON_LEGEND_ITEM_OVER = void 0;
exports.ON_LEGEND_ITEM_OVER = 'ON_LEGEND_ITEM_OVER';
exports.ON_LEGEND_ITEM_OUT = 'ON_LEGEND_ITEM_OUT';
exports.ON_TOGGLE_DESELECT_SERIES = 'ON_TOGGLE_DESELECT_SERIES';
function onLegendItemOverAction(legendPath) {
    return { type: exports.ON_LEGEND_ITEM_OVER, legendPath };
}
exports.onLegendItemOverAction = onLegendItemOverAction;
function onLegendItemOutAction() {
    return { type: exports.ON_LEGEND_ITEM_OUT };
}
exports.onLegendItemOutAction = onLegendItemOutAction;
function onToggleDeselectSeriesAction(legendItemIds, negate = false) {
    return { type: exports.ON_TOGGLE_DESELECT_SERIES, legendItemIds, negate };
}
exports.onToggleDeselectSeriesAction = onToggleDeselectSeriesAction;
//# sourceMappingURL=legend.js.map