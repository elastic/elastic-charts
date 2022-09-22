"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePanelsSelectors = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var panel_1 = require("../../utils/panel");
var panel_utils_1 = require("../../utils/panel_utils");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
exports.computePanelsSelectors = (0, create_selector_1.createCustomCachedSelector)([compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], function (scales) {
    var panelSize = (0, panel_1.getPanelSize)(scales);
    return (0, panel_utils_1.getPerPanelMap)(scales, function () { return panelSize; });
});
//# sourceMappingURL=compute_panels.js.map