"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScaleConfigsFromSpecs = exports.getScaleConfigsFromSpecsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var x_domain_1 = require("../../domains/x_domain");
var y_domain_1 = require("../../domains/y_domain");
var scale_defaults_1 = require("../../scales/scale_defaults");
var axis_utils_1 = require("../../utils/axis_utils");
var group_data_series_1 = require("../../utils/group_data_series");
var spec_1 = require("../utils/spec");
var get_specs_1 = require("./get_specs");
var merge_y_custom_domains_1 = require("./merge_y_custom_domains");
exports.getScaleConfigsFromSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getAxisSpecsSelector, get_specs_1.getSeriesSpecsSelector, get_settings_spec_1.getSettingsSpecSelector], getScaleConfigsFromSpecs);
function getScaleConfigsFromSpecs(axisSpecs, seriesSpecs, settingsSpec) {
    var xAxesSpecs = axisSpecs.filter(function (spec) { return (0, axis_utils_1.isXDomain)(spec.position, settingsSpec.rotation); });
    var maxTickCountForXAxes = xAxesSpecs.reduce(function (acc, _a) {
        var _b = _a.ticks, ticks = _b === void 0 ? scale_defaults_1.X_SCALE_DEFAULT.desiredTickCount : _b;
        return Math.max(acc, ticks);
    }, -Infinity);
    var xScaleConfig = (0, x_domain_1.convertXScaleTypes)(seriesSpecs);
    var x = __assign(__assign({ customDomain: settingsSpec.xDomain }, xScaleConfig), { desiredTickCount: Number.isFinite(maxTickCountForXAxes) ? maxTickCountForXAxes : scale_defaults_1.X_SCALE_DEFAULT.desiredTickCount });
    var scaleConfigsByGroupId = (0, group_data_series_1.groupBy)(seriesSpecs, spec_1.getSpecDomainGroupId, true).reduce(function (acc, series) {
        var groupId = (0, spec_1.getSpecDomainGroupId)(series[0]);
        acc[groupId] = (0, y_domain_1.coerceYScaleTypes)(series);
        return acc;
    }, {});
    var customDomainByGroupId = (0, merge_y_custom_domains_1.mergeYCustomDomainsByGroupId)(axisSpecs, settingsSpec.rotation);
    var yAxisSpecs = axisSpecs.filter(function (spec) { return !(0, axis_utils_1.isXDomain)(spec.position, settingsSpec.rotation); });
    var y = Object.keys(scaleConfigsByGroupId).reduce(function (acc, groupId) {
        var maxTickCountYAxes = yAxisSpecs.reduce(function (maxTickCount, yAxis) {
            var _a;
            return yAxis.groupId === groupId
                ? Math.max(maxTickCount, (_a = yAxis.ticks) !== null && _a !== void 0 ? _a : scale_defaults_1.Y_SCALE_DEFAULT.desiredTickCount)
                : maxTickCount;
        }, -Infinity);
        var desiredTickCount = Number.isFinite(maxTickCountYAxes) ? maxTickCountYAxes : scale_defaults_1.Y_SCALE_DEFAULT.desiredTickCount;
        if (!acc[groupId]) {
            acc[groupId] = __assign(__assign({ customDomain: customDomainByGroupId.get(groupId) }, scaleConfigsByGroupId[groupId]), { desiredTickCount: desiredTickCount });
        }
        acc[groupId].desiredTickCount = Math.max(acc[groupId].desiredTickCount, desiredTickCount);
        return acc;
    }, {});
    return { x: x, y: y };
}
exports.getScaleConfigsFromSpecs = getScaleConfigsFromSpecs;
//# sourceMappingURL=get_api_scale_configs.js.map