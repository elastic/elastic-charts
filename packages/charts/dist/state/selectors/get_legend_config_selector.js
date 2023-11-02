"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendConfigSelector = void 0;
const get_settings_spec_1 = require("./get_settings_spec");
const position_style_1 = require("../../components/legend/position_style");
const create_selector_1 = require("../create_selector");
exports.getLegendConfigSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], ({ flatLegend, legendAction, legendColorPicker, legendMaxDepth, legendSize, legendPosition, legendStrategy, onLegendItemClick, customLegend, showLegend, onLegendItemMinusClick, onLegendItemOut, onLegendItemOver, onLegendItemPlusClick, showLegendExtra, }) => {
    return {
        flatLegend,
        legendAction,
        legendColorPicker,
        legendMaxDepth,
        legendSize,
        legendPosition: (0, position_style_1.getLegendPositionConfig)(legendPosition),
        legendStrategy,
        onLegendItemClick,
        customLegend,
        showLegend,
        onLegendItemMinusClick,
        onLegendItemOut,
        onLegendItemOver,
        onLegendItemPlusClick,
        showLegendExtra,
    };
});
//# sourceMappingURL=get_legend_config_selector.js.map