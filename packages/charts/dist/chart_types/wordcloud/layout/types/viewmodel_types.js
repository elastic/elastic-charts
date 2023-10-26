"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullShapeViewModel = exports.nullWordcloudViewModel = exports.defaultWordcloudSpec = exports.WeightFn = void 0;
exports.WeightFn = Object.freeze({
    log: 'log',
    linear: 'linear',
    exponential: 'exponential',
    squareRoot: 'squareRoot',
});
const commonDefaults = {
    startAngle: -20,
    endAngle: 20,
    angleCount: 5,
    padding: 2,
    fontWeight: 300,
    fontFamily: 'Impact',
    fontStyle: 'italic',
    minFontSize: 10,
    maxFontSize: 50,
    spiral: 'archimedean',
    exponent: 3,
    data: [],
    weightFn: 'exponential',
    outOfRoomCallback: () => { },
};
exports.defaultWordcloudSpec = {
    ...commonDefaults,
};
exports.nullWordcloudViewModel = {
    ...commonDefaults,
    data: [],
};
const nullShapeViewModel = () => ({
    wordcloudViewModel: exports.nullWordcloudViewModel,
    chartCenter: { x: 0, y: 0 },
    pickQuads: () => [],
    specId: 'empty',
});
exports.nullShapeViewModel = nullShapeViewModel;
//# sourceMappingURL=viewmodel_types.js.map