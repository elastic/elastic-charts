"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartThemeSelector = void 0;
const get_settings_spec_1 = require("./get_settings_spec");
const color_library_wrappers_1 = require("../../common/color_library_wrappers");
const common_1 = require("../../utils/common");
const logger_1 = require("../../utils/logger");
const light_theme_1 = require("../../utils/themes/light_theme");
const create_selector_1 = require("../create_selector");
exports.getChartThemeSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], (settingsSpec) => getTheme(settingsSpec.baseTheme, settingsSpec.theme));
function getTheme(baseTheme, theme) {
    const base = baseTheme !== null && baseTheme !== void 0 ? baseTheme : light_theme_1.LIGHT_THEME;
    if (Array.isArray(theme)) {
        const [firstTheme, ...axillaryThemes] = theme;
        return validateTheme((0, common_1.mergePartial)(base, firstTheme, {}, axillaryThemes));
    }
    return validateTheme(theme ? (0, common_1.mergePartial)(base, theme) : base);
}
function validateTheme(theme) {
    const fallbackRGBA = (0, color_library_wrappers_1.colorToRgba)(theme.background.fallbackColor);
    if (fallbackRGBA[3] !== 1) {
        logger_1.Logger.warn(`background.fallbackColor must be opaque, found alpha of ${fallbackRGBA[3]}. Overriding alpha to 1.`);
        const newFallback = (0, color_library_wrappers_1.overrideOpacity)(fallbackRGBA, 1);
        theme.background.fallbackColor = (0, color_library_wrappers_1.RGBATupleToString)(newFallback);
    }
    theme.heatmap.xAxisLabel.rotation = (0, common_1.clamp)(theme.heatmap.xAxisLabel.rotation, 0, 90);
    return theme;
}
//# sourceMappingURL=get_chart_theme.js.map