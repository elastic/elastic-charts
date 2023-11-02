"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartContainerDimensionsSelector = void 0;
const get_legend_config_selector_1 = require("./get_legend_config_selector");
const get_legend_size_1 = require("./get_legend_size");
const common_1 = require("../../utils/common");
const create_selector_1 = require("../create_selector");
const getParentDimension = (state) => state.parentDimensions;
exports.getChartContainerDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([get_legend_config_selector_1.getLegendConfigSelector, get_legend_size_1.getLegendSizeSelector, getParentDimension], ({ showLegend, legendPosition: { floating, direction } }, legendSize, parentDimensions) => floating || !showLegend
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
        });
//# sourceMappingURL=get_chart_container_dimensions.js.map