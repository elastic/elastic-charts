"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFitFunctionToDataSeries = void 0;
const fit_function_1 = require("./fit_function");
const specs_1 = require("./specs");
const spec_1 = require("../state/utils/spec");
const applyFitFunctionToDataSeries = (dataSeries, seriesSpecs, xScaleType) => {
    return dataSeries.map(({ specId, data, ...rest }) => {
        const spec = (0, spec_1.getSpecsById)(seriesSpecs, specId);
        if (spec !== null &&
            spec !== undefined &&
            ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isLineSeriesSpec)(spec)) &&
            spec.fit !== undefined) {
            const fittedData = (0, fit_function_1.fitFunction)(data, spec.fit, xScaleType);
            return {
                specId,
                ...rest,
                data: fittedData,
            };
        }
        return { specId, data, ...rest };
    });
};
exports.applyFitFunctionToDataSeries = applyFitFunctionToDataSeries;
//# sourceMappingURL=fit_function_utils.js.map