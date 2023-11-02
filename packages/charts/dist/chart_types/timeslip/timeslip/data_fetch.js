"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNullDataState = exports.updateDataState = exports.invalid = void 0;
const invalid = (dataState, dataDemand) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return !dataState.valid ||
        dataState.binUnit !== dataDemand.binUnit ||
        dataState.binUnitCount !== dataDemand.binUnitCount ||
        ((_b = (_a = dataDemand.lo) === null || _a === void 0 ? void 0 : _a.minimum) !== null && _b !== void 0 ? _b : -Infinity) < ((_d = (_c = dataState.lo) === null || _c === void 0 ? void 0 : _c.minimum) !== null && _d !== void 0 ? _d : -Infinity) ||
        ((_f = (_e = dataDemand.hi) === null || _e === void 0 ? void 0 : _e.minimum) !== null && _f !== void 0 ? _f : Infinity) > ((_h = (_g = dataState.hi) === null || _g === void 0 ? void 0 : _g.minimum) !== null && _h !== void 0 ? _h : Infinity);
};
exports.invalid = invalid;
const updateDataState = (dataState, dataDemand, dataResponse) => {
    dataState.pending = false;
    dataState.valid = true;
    dataState.lo = dataDemand.lo;
    dataState.hi = dataDemand.hi;
    dataState.binUnit = dataDemand.binUnit;
    dataState.binUnitCount = dataDemand.binUnitCount;
    dataState.dataResponse = dataResponse;
};
exports.updateDataState = updateDataState;
const getNullDataState = () => ({
    valid: false,
    pending: false,
    lo: { minimum: Infinity, supremum: Infinity, labelSupremum: Infinity },
    hi: { minimum: -Infinity, supremum: -Infinity, labelSupremum: -Infinity },
    binUnit: 'year',
    binUnitCount: NaN,
    dataResponse: { stats: { minValue: NaN, maxValue: NaN }, rows: [] },
});
exports.getNullDataState = getNullDataState;
//# sourceMappingURL=data_fetch.js.map