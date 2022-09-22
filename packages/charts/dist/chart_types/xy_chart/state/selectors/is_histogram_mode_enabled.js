"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHistogramModeEnabledSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var utils_1 = require("../utils/utils");
var get_specs_1 = require("./get_specs");
exports.isHistogramModeEnabledSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector], function (seriesSpecs) { return (0, utils_1.isHistogramModeEnabled)(seriesSpecs); });
//# sourceMappingURL=is_histogram_mode_enabled.js.map