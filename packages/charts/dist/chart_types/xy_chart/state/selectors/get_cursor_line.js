"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCursorLinePositionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var crosshair_utils_1 = require("../../crosshair/crosshair_utils");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var get_projected_pointer_position_1 = require("./get_projected_pointer_position");
exports.getCursorLinePositionSelector = (0, create_selector_1.createCustomCachedSelector)([compute_chart_dimensions_1.computeChartDimensionsSelector, get_settings_spec_1.getSettingsSpecSelector, get_projected_pointer_position_1.getProjectedPointerPositionSelector], function (chartDimensions, settingsSpec, projectedPointerPosition) {
    return (0, crosshair_utils_1.getCursorLinePosition)(settingsSpec.rotation, chartDimensions.chartDimensions, projectedPointerPosition);
});
//# sourceMappingURL=get_cursor_line.js.map