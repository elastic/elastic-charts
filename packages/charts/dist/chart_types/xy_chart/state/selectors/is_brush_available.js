"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrushAvailableSelector = void 0;
var constants_1 = require("../../../../scales/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var get_computed_scales_1 = require("./get_computed_scales");
exports.isBrushAvailableSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, get_computed_scales_1.getComputedScalesSelector], function (settingsSpec, scales) { return scales.xScale.type !== constants_1.ScaleType.Ordinal && Boolean(settingsSpec.onBrushEnd); });
//# sourceMappingURL=is_brush_available.js.map