"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartTransformSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const utils_1 = require("../utils/utils");
exports.computeChartTransformSelector = (0, create_selector_1.createCustomCachedSelector)([compute_chart_dimensions_1.computeChartDimensionsSelector, get_settings_spec_1.getSettingsSpecSelector], (chartDimensions, settingsSpecs) => (0, utils_1.computeChartTransform)(chartDimensions.chartDimensions, settingsSpecs.rotation));
//# sourceMappingURL=compute_chart_transform.js.map