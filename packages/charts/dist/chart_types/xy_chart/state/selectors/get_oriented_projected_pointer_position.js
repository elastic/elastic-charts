"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrientedProjectedPointerPositionSelector = void 0;
const get_projected_pointer_position_1 = require("./get_projected_pointer_position");
const panel_utils_1 = require("../../../../common/panel_utils");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const interactions_1 = require("../../utils/interactions");
exports.getOrientedProjectedPointerPositionSelector = (0, create_selector_1.createCustomCachedSelector)([get_projected_pointer_position_1.getProjectedPointerPositionSelector, get_settings_spec_1.getSettingsSpecSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], getOrientedProjectedPointerPosition);
function getOrientedProjectedPointerPosition({ x, y, horizontalPanelValue, verticalPanelValue }, settingsSpec, scales) {
    const panel = (0, panel_utils_1.getPanelSize)(scales);
    return {
        x: (0, interactions_1.getOrientedXPosition)(x, y, settingsSpec.rotation, panel),
        y: (0, interactions_1.getOrientedYPosition)(x, y, settingsSpec.rotation, panel),
        horizontalPanelValue,
        verticalPanelValue,
    };
}
//# sourceMappingURL=get_oriented_projected_pointer_position.js.map