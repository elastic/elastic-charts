"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalIsBrushingAvailableSelector = void 0;
const getInternalIsBrushingAvailableSelector = (state) => {
    if (state.internalChartState) {
        return state.internalChartState.isBrushAvailable(state);
    }
    return false;
};
exports.getInternalIsBrushingAvailableSelector = getInternalIsBrushingAvailableSelector;
//# sourceMappingURL=get_internal_is_brushing_available.js.map