"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScale = exports.computeSmallMultipleScalesSelector = void 0;
const get_internal_main_projection_area_1 = require("./get_internal_main_projection_area");
const get_internal_sm_domains_1 = require("./get_internal_sm_domains");
const get_small_multiples_spec_1 = require("./get_small_multiples_spec");
const scales_1 = require("../../scales");
const specs_1 = require("../../specs");
const create_selector_1 = require("../create_selector");
exports.computeSmallMultipleScalesSelector = (0, create_selector_1.createCustomCachedSelector)([get_internal_sm_domains_1.getInternalSmallMultiplesDomains, get_internal_main_projection_area_1.getInternalMainProjectionAreaSelector, get_small_multiples_spec_1.getSmallMultiplesSpec], ({ smHDomain, smVDomain }, { width, height }, smSpec) => {
    var _a, _b;
    return {
        horizontal: getScale(smHDomain, width, (_a = smSpec === null || smSpec === void 0 ? void 0 : smSpec.style) === null || _a === void 0 ? void 0 : _a.horizontalPanelPadding),
        vertical: getScale(smVDomain, height, (_b = smSpec === null || smSpec === void 0 ? void 0 : smSpec.style) === null || _b === void 0 ? void 0 : _b.verticalPanelPadding),
    };
});
function getScale(domain, maxRange, padding = specs_1.DEFAULT_SM_PANEL_PADDING) {
    const singlePanelSmallMultiple = domain.length <= 1;
    return new scales_1.ScaleBand(domain, [0, maxRange], undefined, singlePanelSmallMultiple ? 0 : padding);
}
exports.getScale = getScale;
//# sourceMappingURL=compute_small_multiple_scales.js.map