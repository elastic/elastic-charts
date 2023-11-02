"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalIsInitializedSelector = exports.InitStatus = void 0;
exports.InitStatus = Object.freeze({
    ParentSizeInvalid: 'ParentSizeInvalid',
    SpecNotInitialized: 'SpecNotInitialized',
    MissingChartType: 'MissingChartType',
    ChartNotInitialized: 'ChartNotInitialized',
    Initialized: 'Initialized',
});
const getInternalIsInitializedSelector = (state) => {
    const { parentDimensions: { width, height }, specsInitialized, internalChartState, } = state;
    if (!specsInitialized) {
        return exports.InitStatus.SpecNotInitialized;
    }
    if (!internalChartState) {
        return exports.InitStatus.MissingChartType;
    }
    if (width <= 0 || height <= 0) {
        return exports.InitStatus.ParentSizeInvalid;
    }
    return internalChartState.isInitialized(state);
};
exports.getInternalIsInitializedSelector = getInternalIsInitializedSelector;
//# sourceMappingURL=get_internal_is_intialized.js.map