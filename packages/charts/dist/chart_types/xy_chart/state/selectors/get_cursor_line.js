"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCursorLinePositionSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_projected_pointer_position_1 = require("./get_projected_pointer_position");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const crosshair_utils_1 = require("../../crosshair/crosshair_utils");
exports.getCursorLinePositionSelector = (0, create_selector_1.createCustomCachedSelector)([compute_chart_dimensions_1.computeChartDimensionsSelector, get_settings_spec_1.getSettingsSpecSelector, get_projected_pointer_position_1.getProjectedPointerPositionSelector], (chartDimensions, settingsSpec, projectedPointerPosition) => (0, crosshair_utils_1.getCursorLinePosition)(settingsSpec.rotation, chartDimensions.chartDimensions, projectedPointerPosition));
//# sourceMappingURL=get_cursor_line.js.map