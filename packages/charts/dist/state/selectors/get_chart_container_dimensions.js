"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartContainerDimensionsSelector = void 0;
var common_1 = require("../../utils/common");
var create_selector_1 = require("../create_selector");
var get_legend_config_selector_1 = require("./get_legend_config_selector");
var get_legend_size_1 = require("./get_legend_size");
var getParentDimension = function (state) { return state.parentDimensions; };
exports.getChartContainerDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([get_legend_config_selector_1.getLegendConfigSelector, get_legend_size_1.getLegendSizeSelector, getParentDimension], function (_a, legendSize, parentDimensions) {
    var showLegend = _a.showLegend, _b = _a.legendPosition, floating = _b.floating, direction = _b.direction;
    return floating || !showLegend
        ? parentDimensions
        : direction === common_1.LayoutDirection.Vertical
            ? {
                left: 0,
                top: 0,
                width: parentDimensions.width - legendSize.width - legendSize.margin * 2,
                height: parentDimensions.height,
            }
            : {
                left: 0,
                top: 0,
                width: parentDimensions.width,
                height: parentDimensions.height - legendSize.height - legendSize.margin * 2,
            };
});
//# sourceMappingURL=get_chart_container_dimensions.js.map