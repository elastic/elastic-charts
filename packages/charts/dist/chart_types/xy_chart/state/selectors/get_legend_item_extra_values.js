"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemExtraValuesSelector = void 0;
const get_computed_scales_1 = require("./get_computed_scales");
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const constants_1 = require("../../../../scales/constants");
const create_selector_1 = require("../../../../state/create_selector");
const tooltip_1 = require("../../tooltip/tooltip");
const EMPTY_MAP = new Map();
exports.getLegendItemExtraValuesSelector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_values_highlighted_geoms_1.getTooltipInfoAndGeomsSelector, get_computed_scales_1.getComputedScalesSelector], ({ tooltip: { values } }, { xScale: { type } }) => type === constants_1.ScaleType.Ordinal ? EMPTY_MAP : (0, tooltip_1.getLegendItemExtraValues)(values));
//# sourceMappingURL=get_legend_item_extra_values.js.map