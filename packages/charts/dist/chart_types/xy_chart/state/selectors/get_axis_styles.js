"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxesStylesSelector = void 0;
const get_specs_1 = require("./get_specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const common_1 = require("../../../../utils/common");
const axis_type_utils_1 = require("../../utils/axis_type_utils");
exports.getAxesStylesSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getAxisSpecsSelector, get_chart_theme_1.getChartThemeSelector], (axesSpecs, { axes: sharedAxesStyle }) => axesSpecs.reduce((axesStyles, { id, style, gridLine, position }) => {
    const gridStyle = gridLine && { gridLine: { [(0, axis_type_utils_1.isVerticalAxis)(position) ? 'vertical' : 'horizontal']: gridLine } };
    return axesStyles.set(id, style ? (0, common_1.mergePartial)(sharedAxesStyle, { ...style, ...gridStyle }) : null);
}, new Map()));
//# sourceMappingURL=get_axis_styles.js.map