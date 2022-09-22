"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrientedProjectedPointerPositionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var interactions_1 = require("../../utils/interactions");
var panel_1 = require("../../utils/panel");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var get_projected_pointer_position_1 = require("./get_projected_pointer_position");
exports.getOrientedProjectedPointerPositionSelector = (0, create_selector_1.createCustomCachedSelector)([get_projected_pointer_position_1.getProjectedPointerPositionSelector, get_settings_spec_1.getSettingsSpecSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], getOrientedProjectedPointerPosition);
function getOrientedProjectedPointerPosition(_a, settingsSpec, scales) {
    var x = _a.x, y = _a.y, horizontalPanelValue = _a.horizontalPanelValue, verticalPanelValue = _a.verticalPanelValue;
    var panel = (0, panel_1.getPanelSize)(scales);
    return {
        x: (0, interactions_1.getOrientedXPosition)(x, y, settingsSpec.rotation, panel),
        y: (0, interactions_1.getOrientedYPosition)(x, y, settingsSpec.rotation, panel),
        horizontalPanelValue: horizontalPanelValue,
        verticalPanelValue: verticalPanelValue,
    };
}
//# sourceMappingURL=get_oriented_projected_pointer_position.js.map