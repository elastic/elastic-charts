"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartTypeDescriptionSelector = void 0;
const get_specs_1 = require("./get_specs");
const create_selector_1 = require("../../../../state/create_selector");
exports.getChartTypeDescriptionSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector], (specs) => {
    const seriesTypes = new Set();
    specs.forEach((value) => seriesTypes.add(value.seriesType));
    return seriesTypes.size > 1 ? `Mixed chart: ${[...seriesTypes].join(' and ')} chart` : `${[...seriesTypes]} chart`;
});
//# sourceMappingURL=get_chart_type_description.js.map