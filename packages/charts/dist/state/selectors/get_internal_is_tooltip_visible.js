"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalIsTooltipVisibleSelector = void 0;
var getInternalIsTooltipVisibleSelector = function (state) {
    if (state.internalChartState) {
        return state.internalChartState.isTooltipVisible(state);
    }
    return { visible: false, isExternal: false, displayOnly: false };
};
exports.getInternalIsTooltipVisibleSelector = getInternalIsTooltipVisibleSelector;
//# sourceMappingURL=get_internal_is_tooltip_visible.js.map