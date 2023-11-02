"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAxisTicksDimensionsSelector = exports.getLabelBox = exports.getJoinedVisibleAxesData = exports.getFallBackTickFormatter = void 0;
const axis_tick_formatter_1 = require("./axis_tick_formatter");
const compute_series_domains_1 = require("./compute_series_domains");
const count_bars_in_cluster_1 = require("./count_bars_in_cluster");
const get_axis_styles_1 = require("./get_axis_styles");
const get_bar_paddings_1 = require("./get_bar_paddings");
const get_specs_1 = require("./get_specs");
const is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
const logger_1 = require("../../../../utils/logger");
const axis_type_utils_1 = require("../../utils/axis_type_utils");
const axis_utils_1 = require("../../utils/axis_utils");
const getScaleFunction = (0, create_selector_1.createCustomCachedSelector)([
    compute_series_domains_1.computeSeriesDomainsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    count_bars_in_cluster_1.countBarsInClusterSelector,
    get_bar_paddings_1.getBarPaddingsSelector,
    is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
], axis_utils_1.getScaleForAxisSpec);
exports.getFallBackTickFormatter = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector], (seriesSpecs) => { var _a, _b; return (_b = (_a = seriesSpecs.find(({ tickFormat }) => tickFormat)) === null || _a === void 0 ? void 0 : _a.tickFormat) !== null && _b !== void 0 ? _b : axis_utils_1.defaultTickFormatter; });
const getUnitScales = (0, create_selector_1.createCustomCachedSelector)([getScaleFunction, get_specs_1.getAxisSpecsSelector], (getScale, axesSpecs) => axesSpecs.reduce((unitScales, axisSpec) => {
    const scale = getScale(axisSpec, [0, 1]);
    if (scale)
        unitScales.set(axisSpec.id, scale);
    else
        logger_1.Logger.warn(`Cannot compute scale for axis spec ${axisSpec.id}. Axis will not be displayed.`);
    return unitScales;
}, new Map()));
const getThemedAxesStyles = (0, create_selector_1.createCustomCachedSelector)([get_chart_theme_1.getChartThemeSelector, get_axis_styles_1.getAxesStylesSelector], (chartTheme, axesStyles) => [...axesStyles.keys()].reduce((styles, id) => { var _a; return styles.set(id, (_a = axesStyles.get(id)) !== null && _a !== void 0 ? _a : chartTheme.axes); }, new Map()));
exports.getJoinedVisibleAxesData = (0, create_selector_1.createCustomCachedSelector)([getUnitScales, get_specs_1.getAxisSpecsSelector, getThemedAxesStyles, get_settings_spec_1.getSettingsSpecSelector, axis_tick_formatter_1.getAxisTickLabelFormatter], (unitScales, axesSpecs, themedAxesStyles, { rotation }, axisTickLabelFormatters) => axesSpecs.reduce((axisData, axisSpec) => {
    var _a;
    const { id, position, hide } = axisSpec;
    const axesStyle = themedAxesStyles.get(id);
    const scale = unitScales.get(id);
    if (scale && axesStyle) {
        const gridLine = (0, axis_type_utils_1.isVerticalAxis)(position) ? axesStyle.gridLine.vertical : axesStyle.gridLine.horizontal;
        const axisShown = gridLine.visible || !hide;
        const isXAxis = (0, axis_utils_1.isXDomain)(position, rotation);
        const labelFormatter = (_a = axisTickLabelFormatters[isXAxis ? 'x' : 'y'].get(id)) !== null && _a !== void 0 ? _a : axis_utils_1.defaultTickFormatter;
        if (axisShown)
            axisData.set(id, {
                axisSpec,
                scale,
                axesStyle,
                gridLine,
                labelFormatter,
                isXAxis,
            });
    }
    return axisData;
}, new Map()));
const getLabelBox = (axesStyle, ticks, labelFormatter, textMeasure, axisSpec, gridLine) => ({
    ...(axesStyle.tickLabel.visible ? ticks.map(labelFormatter) : []).reduce((sizes, labelText) => {
        var _a;
        const bbox = textMeasure(labelText, {
            fontStyle: (_a = axesStyle.tickLabel.fontStyle) !== null && _a !== void 0 ? _a : 'normal',
            fontFamily: axesStyle.tickLabel.fontFamily,
            fontWeight: 'normal',
            fontVariant: 'normal',
        }, axesStyle.tickLabel.fontSize);
        const rotatedBbox = (0, axis_utils_1.computeRotatedLabelDimensions)(bbox, axesStyle.tickLabel.rotation);
        sizes.maxLabelBboxWidth = Math.max(sizes.maxLabelBboxWidth, Math.ceil(rotatedBbox.width));
        sizes.maxLabelBboxHeight = Math.max(sizes.maxLabelBboxHeight, Math.ceil(rotatedBbox.height));
        sizes.maxLabelTextWidth = Math.max(sizes.maxLabelTextWidth, Math.ceil(bbox.width));
        sizes.maxLabelTextHeight = Math.max(sizes.maxLabelTextHeight, Math.ceil(bbox.height));
        return sizes;
    }, { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 }),
    isHidden: axisSpec.hide && gridLine.visible,
});
exports.getLabelBox = getLabelBox;
exports.computeAxisTicksDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([exports.getJoinedVisibleAxesData], (joinedAxesData) => (0, canvas_text_bbox_calculator_1.withTextMeasure)((textMeasure) => [...joinedAxesData].reduce((axesTicksDimensions, [id, { axisSpec, scale, axesStyle, gridLine, labelFormatter }]) => axesTicksDimensions.set(id, (0, exports.getLabelBox)(axesStyle, scale.ticks(), labelFormatter, textMeasure, axisSpec, gridLine)), new Map())));
//# sourceMappingURL=compute_axis_ticks_dimensions.js.map