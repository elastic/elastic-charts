"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartRotationSelector = void 0;
const get_settings_spec_1 = require("./get_settings_spec");
const create_selector_1 = require("../create_selector");
exports.getChartRotationSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], (settingsSpec) => settingsSpec.rotation);
//# sourceMappingURL=get_chart_rotation.js.map