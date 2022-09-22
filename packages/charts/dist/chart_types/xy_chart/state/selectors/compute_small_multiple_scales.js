"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScale = exports.computeSmallMultipleScalesSelector = void 0;
var scales_1 = require("../../../../scales");
var small_multiples_1 = require("../../../../specs/small_multiples");
var create_selector_1 = require("../../../../state/create_selector");
var get_small_multiples_spec_1 = require("../../../../state/selectors/get_small_multiples_spec");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_series_domains_1 = require("./compute_series_domains");
exports.computeSmallMultipleScalesSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector, compute_chart_dimensions_1.computeChartDimensionsSelector, get_small_multiples_spec_1.getSmallMultiplesSpec], function (_a, _b, smSpec) {
    var _c, _d;
    var smHDomain = _a.smHDomain, smVDomain = _a.smVDomain;
    var _e = _b.chartDimensions, width = _e.width, height = _e.height;
    return {
        horizontal: getScale(smHDomain, width, smSpec && ((_c = smSpec[0].style) === null || _c === void 0 ? void 0 : _c.horizontalPanelPadding)),
        vertical: getScale(smVDomain, height, smSpec && ((_d = smSpec[0].style) === null || _d === void 0 ? void 0 : _d.verticalPanelPadding)),
    };
});
function getScale(domain, maxRange, padding) {
    if (padding === void 0) { padding = small_multiples_1.DEFAULT_SM_PANEL_PADDING; }
    var singlePanelSmallMultiple = domain.length <= 1;
    return new scales_1.ScaleBand(domain, [0, maxRange], undefined, singlePanelSmallMultiple ? 0 : padding);
}
exports.getScale = getScale;
//# sourceMappingURL=compute_small_multiple_scales.js.map