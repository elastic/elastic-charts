"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSeriesDomainsSelector = void 0;
const get_api_scale_configs_1 = require("./get_api_scale_configs");
const get_specs_1 = require("./get_specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_small_multiples_index_order_1 = require("../../../../state/selectors/get_small_multiples_index_order");
const utils_1 = require("../utils/utils");
const getDeselectedSeriesSelector = (state) => state.interactions.deselectedDataSeries;
exports.computeSeriesDomainsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_specs_1.getSeriesSpecsSelector,
    get_api_scale_configs_1.getScaleConfigsFromSpecsSelector,
    get_specs_1.getAnnotationSpecsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    getDeselectedSeriesSelector,
    get_small_multiples_index_order_1.getSmallMultiplesIndexOrderSelector,
], utils_1.computeSeriesDomains);
//# sourceMappingURL=compute_series_domains.js.map