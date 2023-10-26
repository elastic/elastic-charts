"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScaleConfigsFromSpecs = exports.getScaleConfigsFromSpecsSelector = void 0;
const get_specs_1 = require("./get_specs");
const merge_y_custom_domains_1 = require("./merge_y_custom_domains");
const constants_1 = require("../../../../scales/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const x_domain_1 = require("../../domains/x_domain");
const y_domain_1 = require("../../domains/y_domain");
const scale_defaults_1 = require("../../scales/scale_defaults");
const axis_utils_1 = require("../../utils/axis_utils");
const group_data_series_1 = require("../../utils/group_data_series");
const spec_1 = require("../utils/spec");
exports.getScaleConfigsFromSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getAxisSpecsSelector, get_specs_1.getSeriesSpecsSelector, get_settings_spec_1.getSettingsSpecSelector], getScaleConfigsFromSpecs);
function getScaleConfigsFromSpecs(axisSpecs, seriesSpecs, settingsSpec) {
    const xAxesSpecs = axisSpecs.filter((spec) => (0, axis_utils_1.isXDomain)(spec.position, settingsSpec.rotation));
    const maxTickCountForXAxes = xAxesSpecs.reduce((acc, { ticks = scale_defaults_1.X_SCALE_DEFAULT.desiredTickCount }) => {
        return Math.max(acc, ticks);
    }, -Infinity);
    const xScaleConfig = (0, x_domain_1.convertXScaleTypes)(seriesSpecs);
    const x = {
        customDomain: settingsSpec.xDomain,
        ...xScaleConfig,
        desiredTickCount: Number.isFinite(maxTickCountForXAxes) ? maxTickCountForXAxes : scale_defaults_1.X_SCALE_DEFAULT.desiredTickCount,
    };
    const scaleConfigsByGroupId = (0, group_data_series_1.groupBy)(seriesSpecs, spec_1.getSpecDomainGroupId, true).reduce((acc, series) => {
        if (series[0]) {
            const groupId = (0, spec_1.getSpecDomainGroupId)(series[0]);
            acc[groupId] = (0, y_domain_1.coerceYScaleTypes)(series);
        }
        return acc;
    }, {});
    const customDomainByGroupId = (0, merge_y_custom_domains_1.mergeYCustomDomainsByGroupId)(axisSpecs, settingsSpec.rotation);
    const yAxisSpecs = axisSpecs.filter((spec) => !(0, axis_utils_1.isXDomain)(spec.position, settingsSpec.rotation));
    const y = Object.keys(scaleConfigsByGroupId).reduce((acc, groupId) => {
        var _a, _b;
        const maxTickCountYAxes = yAxisSpecs.reduce((maxTickCount, yAxis) => {
            var _a;
            return yAxis.groupId === groupId
                ? Math.max(maxTickCount, (_a = yAxis.ticks) !== null && _a !== void 0 ? _a : scale_defaults_1.Y_SCALE_DEFAULT.desiredTickCount)
                : maxTickCount;
        }, -Infinity);
        const desiredTickCount = Number.isFinite(maxTickCountYAxes) ? maxTickCountYAxes : scale_defaults_1.Y_SCALE_DEFAULT.desiredTickCount;
        if (!acc[groupId]) {
            acc[groupId] = {
                customDomain: customDomainByGroupId.get(groupId),
                ...(scaleConfigsByGroupId[groupId] || {
                    nice: false,
                    type: constants_1.ScaleType.Linear,
                }),
                desiredTickCount,
            };
        }
        acc[groupId].desiredTickCount = Math.max((_b = (_a = acc[groupId]) === null || _a === void 0 ? void 0 : _a.desiredTickCount) !== null && _b !== void 0 ? _b : Number.NEGATIVE_INFINITY, desiredTickCount);
        return acc;
    }, {});
    return { x, y };
}
exports.getScaleConfigsFromSpecs = getScaleConfigsFromSpecs;
//# sourceMappingURL=get_api_scale_configs.js.map