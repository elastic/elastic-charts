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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartThemeSelector = void 0;
var color_library_wrappers_1 = require("../../common/color_library_wrappers");
var common_1 = require("../../utils/common");
var logger_1 = require("../../utils/logger");
var light_theme_1 = require("../../utils/themes/light_theme");
var create_selector_1 = require("../create_selector");
var get_settings_spec_1 = require("./get_settings_spec");
exports.getChartThemeSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], function (settingsSpec) { return getTheme(settingsSpec.baseTheme, settingsSpec.theme); });
function getTheme(baseTheme, theme) {
    var base = baseTheme !== null && baseTheme !== void 0 ? baseTheme : light_theme_1.LIGHT_THEME;
    if (Array.isArray(theme)) {
        var _a = __read(theme), firstTheme = _a[0], axillaryThemes = _a.slice(1);
        return validateTheme((0, common_1.mergePartial)(base, firstTheme, {}, axillaryThemes));
    }
    return validateTheme(theme ? (0, common_1.mergePartial)(base, theme) : base);
}
function validateTheme(theme) {
    var fallbackRGBA = (0, color_library_wrappers_1.colorToRgba)(theme.background.fallbackColor);
    if (fallbackRGBA[3] !== 1) {
        logger_1.Logger.warn("background.fallbackColor must be opaque, found alpha of ".concat(fallbackRGBA[3], ". Overriding alpha to 1."));
        var newFallback = (0, color_library_wrappers_1.overrideOpacity)(fallbackRGBA, 1);
        theme.background.fallbackColor = (0, color_library_wrappers_1.RGBATupleToString)(newFallback);
    }
    theme.heatmap.xAxisLabel.rotation = (0, common_1.clamp)(theme.heatmap.xAxisLabel.rotation, 0, 90);
    return theme;
}
//# sourceMappingURL=get_chart_theme.js.map