"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendConfigSelector = void 0;
var position_style_1 = require("../../components/legend/position_style");
var create_selector_1 = require("../create_selector");
var get_settings_spec_1 = require("./get_settings_spec");
exports.getLegendConfigSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], function (_a) {
    var flatLegend = _a.flatLegend, legendAction = _a.legendAction, legendColorPicker = _a.legendColorPicker, legendMaxDepth = _a.legendMaxDepth, legendSize = _a.legendSize, legendPosition = _a.legendPosition, legendStrategy = _a.legendStrategy, onLegendItemClick = _a.onLegendItemClick, showLegend = _a.showLegend, onLegendItemMinusClick = _a.onLegendItemMinusClick, onLegendItemOut = _a.onLegendItemOut, onLegendItemOver = _a.onLegendItemOver, onLegendItemPlusClick = _a.onLegendItemPlusClick, showLegendExtra = _a.showLegendExtra;
    return {
        flatLegend: flatLegend,
        legendAction: legendAction,
        legendColorPicker: legendColorPicker,
        legendMaxDepth: legendMaxDepth,
        legendSize: legendSize,
        legendPosition: (0, position_style_1.getLegendPositionConfig)(legendPosition),
        legendStrategy: legendStrategy,
        onLegendItemClick: onLegendItemClick,
        showLegend: showLegend,
        onLegendItemMinusClick: onLegendItemMinusClick,
        onLegendItemOut: onLegendItemOut,
        onLegendItemOver: onLegendItemOver,
        onLegendItemPlusClick: onLegendItemPlusClick,
        showLegendExtra: showLegendExtra,
    };
});
//# sourceMappingURL=get_legend_config_selector.js.map