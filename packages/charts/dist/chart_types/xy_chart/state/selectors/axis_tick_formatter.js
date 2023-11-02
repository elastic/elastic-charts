"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxisTickLabelFormatter = void 0;
const get_api_scale_configs_1 = require("./get_api_scale_configs");
const get_specs_1 = require("./get_specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const axis_utils_1 = require("../../utils/axis_utils");
const group_data_series_1 = require("../../utils/group_data_series");
exports.getAxisTickLabelFormatter = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector, get_specs_1.getAxisSpecsSelector, get_settings_spec_1.getSettingsSpecSelector, get_api_scale_configs_1.getScaleConfigsFromSpecsSelector], (seriesSpecs, axesSpecs, { rotation }, scaleConfigs) => {
    const seriesByGroupId = (0, group_data_series_1.groupBy)(seriesSpecs, ['groupId'], false);
    const axesByGroupId = (0, group_data_series_1.groupBy)(axesSpecs, ['groupId'], false);
    const groupIds = [...new Set([...Object.keys(seriesByGroupId), ...Object.keys(axesByGroupId)])];
    const { timeZone } = scaleConfigs.x;
    return groupIds.reduce((acc, groupId) => {
        var _a, _b, _c;
        const ySpecDataFormatter = (_b = ((_a = seriesByGroupId[groupId]) !== null && _a !== void 0 ? _a : []).find(({ tickFormat }) => tickFormat)) === null || _b === void 0 ? void 0 : _b.tickFormat;
        const axes = groupAxesByCartesianCoords((_c = axesByGroupId[groupId]) !== null && _c !== void 0 ? _c : [], rotation);
        axes.x.forEach((spec) => {
            acc.x.set(spec.id, (v) => { var _a, _b; return ((_b = (_a = spec === null || spec === void 0 ? void 0 : spec.labelFormat) !== null && _a !== void 0 ? _a : spec === null || spec === void 0 ? void 0 : spec.tickFormat) !== null && _b !== void 0 ? _b : axis_utils_1.defaultTickFormatter)(v, { timeZone }); });
        });
        axes.y.forEach((spec) => {
            acc.y.set(spec.id, (v) => { var _a, _b, _c; return ((_c = (_b = (_a = spec.labelFormat) !== null && _a !== void 0 ? _a : spec.tickFormat) !== null && _b !== void 0 ? _b : ySpecDataFormatter) !== null && _c !== void 0 ? _c : axis_utils_1.defaultTickFormatter)(v, {}); });
        });
        return acc;
    }, { x: new Map(), y: new Map() });
});
function groupAxesByCartesianCoords(sameGroupAxes, chartRotation = 0) {
    return sameGroupAxes.reduce((acc, spec) => {
        acc[(0, axis_utils_1.isXDomain)(spec.position, chartRotation) ? 'x' : 'y'].push(spec);
        return acc;
    }, { x: [], y: [] });
}
//# sourceMappingURL=axis_tick_formatter.js.map