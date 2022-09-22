"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSeriesDomainsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var utils_1 = require("../utils/utils");
var get_api_scale_configs_1 = require("./get_api_scale_configs");
var get_specs_1 = require("./get_specs");
var getDeselectedSeriesSelector = function (state) { return state.interactions.deselectedDataSeries; };
exports.computeSeriesDomainsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_specs_1.getSeriesSpecsSelector,
    get_api_scale_configs_1.getScaleConfigsFromSpecsSelector,
    get_specs_1.getAnnotationSpecsSelector,
    getDeselectedSeriesSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_specs_1.getSmallMultiplesIndexOrderSelector,
], utils_1.computeSeriesDomains);
//# sourceMappingURL=compute_series_domains.js.map