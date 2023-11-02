"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHistogramModeEnabledSelector = void 0;
const get_specs_1 = require("./get_specs");
const create_selector_1 = require("../../../../state/create_selector");
const utils_1 = require("../utils/utils");
exports.isHistogramModeEnabledSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector], (seriesSpecs) => (0, utils_1.isHistogramModeEnabled)(seriesSpecs));
//# sourceMappingURL=is_histogram_mode_enabled.js.map