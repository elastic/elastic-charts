"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartTransformSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var utils_1 = require("../utils/utils");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
exports.computeChartTransformSelector = (0, create_selector_1.createCustomCachedSelector)([compute_chart_dimensions_1.computeChartDimensionsSelector, get_settings_spec_1.getSettingsSpecSelector], function (chartDimensions, settingsSpecs) {
    return (0, utils_1.computeChartTransform)(chartDimensions.chartDimensions, settingsSpecs.rotation);
});
//# sourceMappingURL=compute_chart_transform.js.map