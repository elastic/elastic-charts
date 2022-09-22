"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxisTickLabelFormatter = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var axis_utils_1 = require("../../utils/axis_utils");
var group_data_series_1 = require("../../utils/group_data_series");
var get_api_scale_configs_1 = require("./get_api_scale_configs");
var get_specs_1 = require("./get_specs");
exports.getAxisTickLabelFormatter = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector, get_specs_1.getAxisSpecsSelector, get_settings_spec_1.getSettingsSpecSelector, get_api_scale_configs_1.getScaleConfigsFromSpecsSelector], function (seriesSpecs, axesSpecs, _a, scaleConfigs) {
    var rotation = _a.rotation;
    var seriesByGroupId = (0, group_data_series_1.groupBy)(seriesSpecs, ['groupId'], false);
    var axesByGroupId = (0, group_data_series_1.groupBy)(axesSpecs, ['groupId'], false);
    var groupIds = __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(Object.keys(seriesByGroupId)), false), __read(Object.keys(axesByGroupId)), false))), false);
    var timeZone = scaleConfigs.x.timeZone;
    return groupIds.reduce(function (acc, groupId) {
        var _a, _b, _c;
        var ySpecDataFormatter = (_b = ((_a = seriesByGroupId[groupId]) !== null && _a !== void 0 ? _a : []).find(function (_a) {
            var tickFormat = _a.tickFormat;
            return tickFormat;
        })) === null || _b === void 0 ? void 0 : _b.tickFormat;
        var axes = groupAxesByCartesianCoords((_c = axesByGroupId[groupId]) !== null && _c !== void 0 ? _c : [], rotation);
        axes.x.forEach(function (spec) {
            acc.x.set(spec.id, function (v) { var _a, _b; return ((_b = (_a = spec === null || spec === void 0 ? void 0 : spec.labelFormat) !== null && _a !== void 0 ? _a : spec === null || spec === void 0 ? void 0 : spec.tickFormat) !== null && _b !== void 0 ? _b : axis_utils_1.defaultTickFormatter)(v, { timeZone: timeZone }); });
        });
        axes.y.forEach(function (spec) {
            acc.y.set(spec.id, function (v) { var _a, _b, _c; return ((_c = (_b = (_a = spec.labelFormat) !== null && _a !== void 0 ? _a : spec.tickFormat) !== null && _b !== void 0 ? _b : ySpecDataFormatter) !== null && _c !== void 0 ? _c : axis_utils_1.defaultTickFormatter)(v, {}); });
        });
        return acc;
    }, { x: new Map(), y: new Map() });
});
function groupAxesByCartesianCoords(sameGroupAxes, chartRotation) {
    if (chartRotation === void 0) { chartRotation = 0; }
    return sameGroupAxes.reduce(function (acc, spec) {
        acc[(0, axis_utils_1.isXDomain)(spec.position, chartRotation) ? 'x' : 'y'].push(spec);
        return acc;
    }, { x: [], y: [] });
}
//# sourceMappingURL=axis_tick_formatter.js.map