"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsSpecSelector = void 0;
const get_specs_1 = require("./get_specs");
const chart_types_1 = require("../../chart_types");
const constants_1 = require("../../specs/constants");
const debounce_1 = require("../../utils/debounce");
const create_selector_1 = require("../create_selector");
const utils_1 = require("../utils");
const DEFAULT_POINTER_UPDATE_DEBOUNCE = 16;
exports.getSettingsSpecSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], getSettingsSpec);
function getSettingsSpec(specs) {
    const settingsSpecs = (0, utils_1.getSpecsFromStore)(specs, chart_types_1.ChartType.Global, constants_1.SpecType.Settings);
    const spec = settingsSpecs[0];
    return spec ? handleListenerDebouncing(spec) : constants_1.DEFAULT_SETTINGS_SPEC;
}
function handleListenerDebouncing(settings) {
    var _a;
    const delay = (_a = settings.pointerUpdateDebounce) !== null && _a !== void 0 ? _a : DEFAULT_POINTER_UPDATE_DEBOUNCE;
    if (settings.onPointerUpdate)
        settings.onPointerUpdate = (0, debounce_1.debounce)(settings.onPointerUpdate, delay);
    return settings;
}
//# sourceMappingURL=get_settings_spec.js.map