"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullShapeViewModel = exports.nullWordcloudViewModel = exports.defaultWordcloudSpec = exports.WeightFn = void 0;
exports.WeightFn = Object.freeze({
    log: 'log',
    linear: 'linear',
    exponential: 'exponential',
    squareRoot: 'squareRoot',
});
var commonDefaults = {
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
    outOfRoomCallback: function () { },
};
exports.defaultWordcloudSpec = __assign({}, commonDefaults);
exports.nullWordcloudViewModel = __assign(__assign({}, commonDefaults), { data: [] });
var nullShapeViewModel = function () { return ({
    wordcloudViewModel: exports.nullWordcloudViewModel,
    chartCenter: { x: 0, y: 0 },
    pickQuads: function () { return []; },
    specId: 'empty',
}); };
exports.nullShapeViewModel = nullShapeViewModel;
//# sourceMappingURL=viewmodel_types.js.map