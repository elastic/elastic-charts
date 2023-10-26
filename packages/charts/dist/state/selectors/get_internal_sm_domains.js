"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalSmallMultiplesDomains = void 0;
const getInternalSmallMultiplesDomains = (state) => {
    if (state.internalChartState) {
        return state.internalChartState.getSmallMultiplesDomains(state);
    }
    return {
        smHDomain: [],
        smVDomain: [],
    };
};
exports.getInternalSmallMultiplesDomains = getInternalSmallMultiplesDomains;
//# sourceMappingURL=get_internal_sm_domains.js.map