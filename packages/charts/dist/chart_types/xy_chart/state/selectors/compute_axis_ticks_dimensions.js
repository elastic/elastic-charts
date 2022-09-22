"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAxisTicksDimensionsSelector = exports.getLabelBox = exports.getJoinedVisibleAxesData = exports.getFallBackTickFormatter = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
var logger_1 = require("../../../../utils/logger");
var axis_type_utils_1 = require("../../utils/axis_type_utils");
var axis_utils_1 = require("../../utils/axis_utils");
var axis_tick_formatter_1 = require("./axis_tick_formatter");
var compute_series_domains_1 = require("./compute_series_domains");
var count_bars_in_cluster_1 = require("./count_bars_in_cluster");
var get_axis_styles_1 = require("./get_axis_styles");
var get_bar_paddings_1 = require("./get_bar_paddings");
var get_specs_1 = require("./get_specs");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
var getScaleFunction = (0, create_selector_1.createCustomCachedSelector)([
    compute_series_domains_1.computeSeriesDomainsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    count_bars_in_cluster_1.countBarsInClusterSelector,
    get_bar_paddings_1.getBarPaddingsSelector,
    is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
], axis_utils_1.getScaleForAxisSpec);
exports.getFallBackTickFormatter = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector], function (seriesSpecs) { var _a, _b; return (_b = (_a = seriesSpecs.find(function (_a) {
    var tickFormat = _a.tickFormat;
    return tickFormat;
})) === null || _a === void 0 ? void 0 : _a.tickFormat) !== null && _b !== void 0 ? _b : axis_utils_1.defaultTickFormatter; });
var getUnitScales = (0, create_selector_1.createCustomCachedSelector)([getScaleFunction, get_specs_1.getAxisSpecsSelector], function (getScale, axesSpecs) {
    return axesSpecs.reduce(function (unitScales, axisSpec) {
        var scale = getScale(axisSpec, [0, 1]);
        if (scale)
            unitScales.set(axisSpec.id, scale);
        else
            logger_1.Logger.warn("Cannot compute scale for axis spec ".concat(axisSpec.id, ". Axis will not be displayed."));
        return unitScales;
    }, new Map());
});
var getThemedAxesStyles = (0, create_selector_1.createCustomCachedSelector)([get_chart_theme_1.getChartThemeSelector, get_axis_styles_1.getAxesStylesSelector], function (chartTheme, axesStyles) {
    return __spreadArray([], __read(axesStyles.keys()), false).reduce(function (styles, id) { var _a; return styles.set(id, (_a = axesStyles.get(id)) !== null && _a !== void 0 ? _a : chartTheme.axes); }, new Map());
});
exports.getJoinedVisibleAxesData = (0, create_selector_1.createCustomCachedSelector)([getUnitScales, get_specs_1.getAxisSpecsSelector, getThemedAxesStyles, get_settings_spec_1.getSettingsSpecSelector, axis_tick_formatter_1.getAxisTickLabelFormatter], function (unitScales, axesSpecs, themedAxesStyles, _a, axisTickLabelFormatters) {
    var rotation = _a.rotation;
    return axesSpecs.reduce(function (axisData, axisSpec) {
        var _a;
        var id = axisSpec.id, position = axisSpec.position, hide = axisSpec.hide;
        var axesStyle = themedAxesStyles.get(id);
        var scale = unitScales.get(id);
        if (scale && axesStyle) {
            var gridLine = (0, axis_type_utils_1.isVerticalAxis)(position) ? axesStyle.gridLine.vertical : axesStyle.gridLine.horizontal;
            var axisShown = gridLine.visible || !hide;
            var isXAxis = (0, axis_utils_1.isXDomain)(position, rotation);
            var labelFormatter = (_a = axisTickLabelFormatters[isXAxis ? 'x' : 'y'].get(id)) !== null && _a !== void 0 ? _a : axis_utils_1.defaultTickFormatter;
            if (axisShown)
                axisData.set(id, {
                    axisSpec: axisSpec,
                    scale: scale,
                    axesStyle: axesStyle,
                    gridLine: gridLine,
                    labelFormatter: labelFormatter,
                    isXAxis: isXAxis,
                });
        }
        return axisData;
    }, new Map());
});
var getLabelBox = function (axesStyle, ticks, labelFormatter, textMeasure, axisSpec, gridLine) { return (__assign(__assign({}, (axesStyle.tickLabel.visible ? ticks.map(labelFormatter) : []).reduce(function (sizes, labelText) {
    var _a;
    var bbox = textMeasure(labelText, {
        fontStyle: (_a = axesStyle.tickLabel.fontStyle) !== null && _a !== void 0 ? _a : 'normal',
        fontFamily: axesStyle.tickLabel.fontFamily,
        fontWeight: 'normal',
        fontVariant: 'normal',
    }, axesStyle.tickLabel.fontSize);
    var rotatedBbox = (0, axis_utils_1.computeRotatedLabelDimensions)(bbox, axesStyle.tickLabel.rotation);
    sizes.maxLabelBboxWidth = Math.max(sizes.maxLabelBboxWidth, Math.ceil(rotatedBbox.width));
    sizes.maxLabelBboxHeight = Math.max(sizes.maxLabelBboxHeight, Math.ceil(rotatedBbox.height));
    sizes.maxLabelTextWidth = Math.max(sizes.maxLabelTextWidth, Math.ceil(bbox.width));
    sizes.maxLabelTextHeight = Math.max(sizes.maxLabelTextHeight, Math.ceil(bbox.height));
    return sizes;
}, { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 })), { isHidden: axisSpec.hide && gridLine.visible })); };
exports.getLabelBox = getLabelBox;
exports.computeAxisTicksDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([exports.getJoinedVisibleAxesData], function (joinedAxesData) {
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)(function (textMeasure) {
        return __spreadArray([], __read(joinedAxesData), false).reduce(function (axesTicksDimensions, _a) {
            var _b = __read(_a, 2), id = _b[0], _c = _b[1], axisSpec = _c.axisSpec, scale = _c.scale, axesStyle = _c.axesStyle, gridLine = _c.gridLine, labelFormatter = _c.labelFormatter;
            return axesTicksDimensions.set(id, (0, exports.getLabelBox)(axesStyle, scale.ticks(), labelFormatter, textMeasure, axisSpec, gridLine));
        }, new Map());
    });
});
//# sourceMappingURL=compute_axis_ticks_dimensions.js.map