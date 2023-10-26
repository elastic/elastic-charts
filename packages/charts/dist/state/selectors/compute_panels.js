"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePanelsSelectors = void 0;
const compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
const panel_utils_1 = require("../../common/panel_utils");
const create_selector_1 = require("../create_selector");
exports.computePanelsSelectors = (0, create_selector_1.createCustomCachedSelector)([compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], (scales) => {
    const panelSize = (0, panel_utils_1.getPanelSize)(scales);
    return (0, panel_utils_1.getPerPanelMap)(scales, () => panelSize);
});
//# sourceMappingURL=compute_panels.js.map