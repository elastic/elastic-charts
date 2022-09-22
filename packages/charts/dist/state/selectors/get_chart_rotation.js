"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartRotationSelector = void 0;
var create_selector_1 = require("../create_selector");
var get_settings_spec_1 = require("./get_settings_spec");
exports.getChartRotationSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], function (settingsSpec) { return settingsSpec.rotation; });
//# sourceMappingURL=get_chart_rotation.js.map