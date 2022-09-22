"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsSpecSelector = void 0;
var chart_types_1 = require("../../chart_types");
var constants_1 = require("../../specs/constants");
var debounce_1 = require("../../utils/debounce");
var create_selector_1 = require("../create_selector");
var utils_1 = require("../utils");
var get_specs_1 = require("./get_specs");
var DEFAULT_POINTER_UPDATE_DEBOUNCE = 16;
exports.getSettingsSpecSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], getSettingsSpec);
function getSettingsSpec(specs) {
    var settingsSpecs = (0, utils_1.getSpecsFromStore)(specs, chart_types_1.ChartType.Global, constants_1.SpecType.Settings);
    if (settingsSpecs.length === 1) {
        return handleListenerDebouncing(settingsSpecs[0]);
    }
    return constants_1.DEFAULT_SETTINGS_SPEC;
}
function handleListenerDebouncing(settings) {
    var _a;
    var delay = (_a = settings.pointerUpdateDebounce) !== null && _a !== void 0 ? _a : DEFAULT_POINTER_UPDATE_DEBOUNCE;
    if (settings.onPointerUpdate)
        settings.onPointerUpdate = (0, debounce_1.debounce)(settings.onPointerUpdate, delay);
    return settings;
}
//# sourceMappingURL=get_settings_spec.js.map