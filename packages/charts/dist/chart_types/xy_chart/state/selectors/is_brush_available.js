"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrushAvailableSelector = void 0;
const get_computed_scales_1 = require("./get_computed_scales");
const constants_1 = require("../../../../scales/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
exports.isBrushAvailableSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, get_computed_scales_1.getComputedScalesSelector], (settingsSpec, scales) => scales.xScale.type !== constants_1.ScaleType.Ordinal && Boolean(settingsSpec.onBrushEnd));
//# sourceMappingURL=is_brush_available.js.map