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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFitFunctionToDataSeries = void 0;
var spec_1 = require("../state/utils/spec");
var fit_function_1 = require("./fit_function");
var specs_1 = require("./specs");
var applyFitFunctionToDataSeries = function (dataSeries, seriesSpecs, xScaleType) {
    return dataSeries.map(function (_a) {
        var specId = _a.specId, data = _a.data, rest = __rest(_a, ["specId", "data"]);
        var spec = (0, spec_1.getSpecsById)(seriesSpecs, specId);
        if (spec !== null &&
            spec !== undefined &&
            ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isLineSeriesSpec)(spec)) &&
            spec.fit !== undefined) {
            var fittedData = (0, fit_function_1.fitFunction)(data, spec.fit, xScaleType);
            return __assign(__assign({ specId: specId }, rest), { data: fittedData });
        }
        return __assign({ specId: specId, data: data }, rest);
    });
};
exports.applyFitFunctionToDataSeries = applyFitFunctionToDataSeries;
//# sourceMappingURL=fit_function_utils.js.map