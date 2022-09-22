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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarIndexKey = exports.computeChartTransform = exports.computeXScaleOffset = exports.isHistogramModeEnabled = exports.setBarSeriesAccessors = exports.computeSeriesGeometries = exports.computeSeriesDomains = exports.getCustomSeriesColors = void 0;
var predicate_1 = require("../../../../common/predicate");
var common_1 = require("../../../../utils/common");
var curves_1 = require("../../../../utils/curves");
var series_sort_1 = require("../../../../utils/series_sort");
var x_domain_1 = require("../../domains/x_domain");
var y_domain_1 = require("../../domains/y_domain");
var area_1 = require("../../rendering/area");
var bars_1 = require("../../rendering/bars");
var bubble_1 = require("../../rendering/bubble");
var line_1 = require("../../rendering/line");
var default_series_sort_fn_1 = require("../../utils/default_series_sort_fn");
var fill_series_1 = require("../../utils/fill_series");
var group_data_series_1 = require("../../utils/group_data_series");
var indexed_geometry_map_1 = require("../../utils/indexed_geometry_map");
var scales_1 = require("../../utils/scales");
var series_1 = require("../../utils/series");
var specs_1 = require("../../utils/specs");
var common_2 = require("./common");
var spec_1 = require("./spec");
function getCustomSeriesColors(dataSeries) {
    var updatedCustomSeriesColors = new Map();
    var counters = new Map();
    dataSeries.forEach(function (ds) {
        var spec = ds.spec, specId = ds.specId;
        var dataSeriesKey = {
            specId: ds.specId,
            xAccessor: ds.xAccessor,
            yAccessor: ds.yAccessor,
            splitAccessors: ds.splitAccessors,
            smVerticalAccessorValue: undefined,
            smHorizontalAccessorValue: undefined,
        };
        var seriesKey = (0, series_1.getSeriesKey)(dataSeriesKey, ds.groupId);
        if (!spec || !spec.color) {
            return;
        }
        var color;
        if (!color && spec.color) {
            if (typeof spec.color === 'string') {
                color = spec.color;
            }
            else {
                var counter = counters.get(specId) || 0;
                color = Array.isArray(spec.color) ? spec.color[counter % spec.color.length] : spec.color(ds);
                counters.set(specId, counter + 1);
            }
        }
        if (color) {
            updatedCustomSeriesColors.set(seriesKey, color);
        }
    });
    return updatedCustomSeriesColors;
}
exports.getCustomSeriesColors = getCustomSeriesColors;
function computeSeriesDomains(seriesSpecs, scaleConfigs, annotations, deselectedDataSeries, settingsSpec, smallMultiples) {
    var _a, _b, _c, _d;
    if (deselectedDataSeries === void 0) { deselectedDataSeries = []; }
    var orderOrdinalBinsBy = settingsSpec === null || settingsSpec === void 0 ? void 0 : settingsSpec.orderOrdinalBinsBy;
    var _e = (0, series_1.getDataSeriesFromSpecs)(seriesSpecs, deselectedDataSeries, orderOrdinalBinsBy, smallMultiples), dataSeries = _e.dataSeries, xValues = _e.xValues, fallbackScale = _e.fallbackScale, smHValues = _e.smHValues, smVValues = _e.smVValues;
    var xDomain = (0, x_domain_1.mergeXDomain)(scaleConfigs.x, xValues, fallbackScale);
    var filledDataSeries = (0, fill_series_1.fillSeries)(dataSeries, xValues, xDomain.type);
    var seriesSortFn = (0, series_sort_1.getRenderingCompareFn)(function (a, b) {
        return (0, default_series_sort_fn_1.defaultXYSeriesSort)(a, b);
    });
    var formattedDataSeries = (0, series_1.getFormattedDataSeries)(seriesSpecs, filledDataSeries, xValues, xDomain.type).sort(seriesSortFn);
    var annotationYValueMap = getAnnotationYValueMap(annotations, scaleConfigs.y);
    var yDomains = (0, y_domain_1.mergeYDomain)(scaleConfigs.y, formattedDataSeries, annotationYValueMap);
    var horizontalPredicate = (_b = (_a = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.horizontal) === null || _a === void 0 ? void 0 : _a.sort) !== null && _b !== void 0 ? _b : predicate_1.Predicate.DataIndex;
    var smHDomain = __spreadArray([], __read(smHValues), false).sort((0, predicate_1.getPredicateFn)(horizontalPredicate));
    var verticalPredicate = (_d = (_c = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.vertical) === null || _c === void 0 ? void 0 : _c.sort) !== null && _d !== void 0 ? _d : predicate_1.Predicate.DataIndex;
    var smVDomain = __spreadArray([], __read(smVValues), false).sort((0, predicate_1.getPredicateFn)(verticalPredicate));
    return {
        xDomain: xDomain,
        yDomains: yDomains,
        smHDomain: smHDomain,
        smVDomain: smVDomain,
        formattedDataSeries: formattedDataSeries,
    };
}
exports.computeSeriesDomains = computeSeriesDomains;
function getAnnotationYValueMap(annotations, yScaleConfig) {
    return annotations.reduce(function (acc, spec) {
        var _a, _b, _c;
        var _d = ((_b = (_a = yScaleConfig[spec.groupId]) === null || _a === void 0 ? void 0 : _a.customDomain) !== null && _b !== void 0 ? _b : {}).includeDataFromIds, includeDataFromIds = _d === void 0 ? [] : _d;
        if (!includeDataFromIds.includes(spec.id))
            return acc.set(spec.groupId, []);
        var yValues = (0, specs_1.isLineAnnotation)(spec)
            ? spec.domainType === specs_1.AnnotationDomainType.YDomain
                ? spec.dataValues.map(function (_a) {
                    var dataValue = _a.dataValue;
                    return dataValue;
                })
                : []
            : spec.dataValues.flatMap(function (_a) {
                var _b = _a.coordinates, y0 = _b.y0, y1 = _b.y1;
                return [y0, y1];
            });
        var groupValues = (_c = acc.get(spec.groupId)) !== null && _c !== void 0 ? _c : [];
        return acc.set(spec.groupId, __spreadArray(__spreadArray([], __read(groupValues), false), __read(yValues.filter(common_1.isFiniteNumber)), false));
    }, new Map());
}
function computeSeriesGeometries(seriesSpecs, _a, seriesColorMap, chartTheme, _b, axesSpecs, smallMultiplesScales, enableHistogramMode, fallbackTickFormatter, measureText) {
    var xDomain = _a.xDomain, yDomains = _a.yDomains, nonFilteredDataSeries = _a.formattedDataSeries;
    var chartRotation = _b.rotation;
    var chartColors = chartTheme.colors;
    var formattedDataSeries = nonFilteredDataSeries.filter(function (_a) {
        var isFiltered = _a.isFiltered;
        return !isFiltered;
    });
    var barDataSeries = formattedDataSeries.filter(function (_a) {
        var spec = _a.spec;
        return (0, specs_1.isBarSeriesSpec)(spec);
    });
    var dataSeriesGroupedByPanel = (0, group_data_series_1.groupBy)(barDataSeries, ['smVerticalAccessorValue', 'smHorizontalAccessorValue'], false);
    var barIndexByPanel = Object.keys(dataSeriesGroupedByPanel).reduce(function (acc, panelKey) {
        var panelBars = dataSeriesGroupedByPanel[panelKey];
        var barDataSeriesByBarIndex = (0, group_data_series_1.groupBy)(panelBars, function (d) { return getBarIndexKey(d, enableHistogramMode); }, false);
        acc[panelKey] = Object.keys(barDataSeriesByBarIndex);
        return acc;
    }, {});
    var horizontal = smallMultiplesScales.horizontal, vertical = smallMultiplesScales.vertical;
    var yScales = (0, scales_1.computeYScales)({
        yDomains: yDomains,
        range: [(0, common_2.isHorizontalRotation)(chartRotation) ? vertical.bandwidth : horizontal.bandwidth, 0],
    });
    var computedGeoms = renderGeometries(formattedDataSeries, xDomain, yScales, vertical, horizontal, barIndexByPanel, seriesSpecs, seriesColorMap, chartColors.defaultVizColor, axesSpecs, chartTheme, enableHistogramMode, chartRotation, fallbackTickFormatter, measureText);
    var totalBarsInCluster = Object.values(barIndexByPanel).reduce(function (acc, curr) { return Math.max(acc, curr.length); }, 0);
    var xScale = (0, scales_1.computeXScale)({
        xDomain: xDomain,
        totalBarsInCluster: totalBarsInCluster,
        range: [0, (0, common_2.isHorizontalRotation)(chartRotation) ? horizontal.bandwidth : vertical.bandwidth],
        barsPadding: enableHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding,
        enableHistogramMode: enableHistogramMode,
    });
    return __assign({ scales: { xScale: xScale, yScales: yScales } }, computedGeoms);
}
exports.computeSeriesGeometries = computeSeriesGeometries;
function setBarSeriesAccessors(isHistogramMode, seriesSpecs) {
    var e_1, _a;
    if (isHistogramMode) {
        try {
            for (var seriesSpecs_1 = __values(seriesSpecs), seriesSpecs_1_1 = seriesSpecs_1.next(); !seriesSpecs_1_1.done; seriesSpecs_1_1 = seriesSpecs_1.next()) {
                var _b = __read(seriesSpecs_1_1.value, 2), spec = _b[1];
                if ((0, specs_1.isBarSeriesSpec)(spec))
                    spec.stackAccessors = __spreadArray(__spreadArray([], __read((spec.stackAccessors || spec.yAccessors)), false), __read((spec.splitSeriesAccessors || [])), false);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (seriesSpecs_1_1 && !seriesSpecs_1_1.done && (_a = seriesSpecs_1.return)) _a.call(seriesSpecs_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
exports.setBarSeriesAccessors = setBarSeriesAccessors;
function isHistogramModeEnabled(seriesSpecs) {
    return seriesSpecs.some(function (spec) { return (0, specs_1.isBarSeriesSpec)(spec) && spec.enableHistogramMode; });
}
exports.isHistogramModeEnabled = isHistogramModeEnabled;
function computeXScaleOffset(xScale, enableHistogramMode, histogramModeAlignment) {
    if (histogramModeAlignment === void 0) { histogramModeAlignment = specs_1.HistogramModeAlignments.Start; }
    if (!enableHistogramMode) {
        return 0;
    }
    var bandwidth = xScale.bandwidth, barsPadding = xScale.barsPadding;
    var band = bandwidth / (1 - barsPadding);
    var halfPadding = (band - bandwidth) / 2;
    var startAlignmentOffset = bandwidth / 2 + halfPadding;
    switch (histogramModeAlignment) {
        case specs_1.HistogramModeAlignments.Center:
            return 0;
        case specs_1.HistogramModeAlignments.End:
            return -startAlignmentOffset;
        default:
            return startAlignmentOffset;
    }
}
exports.computeXScaleOffset = computeXScaleOffset;
function renderGeometries(dataSeries, xDomain, yScales, smVScale, smHScale, barIndexOrderPerPanel, seriesSpecs, seriesColorsMap, defaultColor, axesSpecs, chartTheme, enableHistogramMode, chartRotation, fallBackTickFormatter, measureText) {
    var _a, _b, _c;
    var len = dataSeries.length;
    var i;
    var points = [];
    var bars = [];
    var areas = [];
    var lines = [];
    var bubbles = [];
    var geometriesIndex = new indexed_geometry_map_1.IndexedGeometryMap();
    var isMixedChart = (0, common_1.isUniqueArray)(seriesSpecs, function (_a) {
        var seriesType = _a.seriesType;
        return seriesType;
    }) && seriesSpecs.length > 1;
    var geometriesCounts = {
        points: 0,
        bars: 0,
        areas: 0,
        areasPoints: 0,
        lines: 0,
        linePoints: 0,
        bubbles: 0,
        bubblePoints: 0,
    };
    var barsPadding = enableHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding;
    for (i = 0; i < len; i++) {
        var ds = dataSeries[i];
        var spec = (0, spec_1.getSpecsById)(seriesSpecs, ds.specId);
        if (spec === undefined) {
            continue;
        }
        var yScale = yScales.get((0, spec_1.getSpecDomainGroupId)(ds.spec));
        if (!yScale) {
            continue;
        }
        var barPanelKey = [ds.smVerticalAccessorValue, ds.smHorizontalAccessorValue].join('|');
        var barIndexOrder = barIndexOrderPerPanel[barPanelKey];
        var xScale = (0, scales_1.computeXScale)({
            xDomain: xDomain,
            totalBarsInCluster: (_a = barIndexOrder === null || barIndexOrder === void 0 ? void 0 : barIndexOrder.length) !== null && _a !== void 0 ? _a : 0,
            range: [0, (0, common_2.isHorizontalRotation)(chartRotation) ? smHScale.bandwidth : smVScale.bandwidth],
            barsPadding: barsPadding,
            enableHistogramMode: enableHistogramMode,
        });
        var stackMode = ds.stackMode;
        var leftPos = (!(0, common_1.isNil)(ds.smHorizontalAccessorValue) && smHScale.scale(ds.smHorizontalAccessorValue)) || 0;
        var topPos = (!(0, common_1.isNil)(ds.smVerticalAccessorValue) && smVScale.scale(ds.smVerticalAccessorValue)) || 0;
        var panel = {
            width: smHScale.bandwidth,
            height: smVScale.bandwidth,
            top: topPos,
            left: leftPos,
        };
        var dataSeriesKey = (0, series_1.getSeriesKey)({
            specId: ds.specId,
            yAccessor: ds.yAccessor,
            splitAccessors: ds.splitAccessors,
        }, ds.groupId);
        var color = seriesColorsMap.get(dataSeriesKey) || defaultColor;
        if ((0, specs_1.isBarSeriesSpec)(spec)) {
            var shift = barIndexOrder.indexOf(getBarIndexKey(ds, enableHistogramMode));
            if (shift === -1)
                continue;
            var barSeriesStyle = (0, common_1.mergePartial)(chartTheme.barSeriesStyle, spec.barSeriesStyle);
            var yAxis = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, spec.groupId, chartRotation).yAxis;
            var valueFormatter = (_b = yAxis === null || yAxis === void 0 ? void 0 : yAxis.tickFormat) !== null && _b !== void 0 ? _b : fallBackTickFormatter;
            var displayValueSettings = spec.displayValueSettings
                ? __assign({ valueFormatter: valueFormatter }, spec.displayValueSettings) : undefined;
            var renderedBars = (0, bars_1.renderBars)(measureText, shift, ds, xScale, yScale, panel, chartRotation, (_c = spec.minBarHeight) !== null && _c !== void 0 ? _c : 0, color, barSeriesStyle, displayValueSettings, spec.styleAccessor, stackMode);
            geometriesIndex.merge(renderedBars.indexedGeometryMap);
            bars.push({ panel: panel, value: renderedBars.barGeometries });
            geometriesCounts.bars += renderedBars.barGeometries.length;
        }
        else if ((0, specs_1.isBubbleSeriesSpec)(spec)) {
            var bubbleShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
            var bubbleSeriesStyle = spec.bubbleSeriesStyle
                ? (0, common_1.mergePartial)(chartTheme.bubbleSeriesStyle, spec.bubbleSeriesStyle)
                : chartTheme.bubbleSeriesStyle;
            var xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode);
            var renderedBubbles = (0, bubble_1.renderBubble)((xScale.bandwidth * bubbleShift) / 2, ds, xScale, yScale, color, panel, (0, series_1.isBandedSpec)(spec), xScaleOffset, bubbleSeriesStyle, {
                enabled: spec.markSizeAccessor !== undefined,
                ratio: chartTheme.markSizeRatio,
            }, isMixedChart, spec.pointStyleAccessor);
            geometriesIndex.merge(renderedBubbles.indexedGeometryMap);
            bubbles.push({
                panel: panel,
                value: renderedBubbles.bubbleGeometry,
            });
            geometriesCounts.bubblePoints += renderedBubbles.bubbleGeometry.points.length;
            geometriesCounts.bubbles += 1;
        }
        else if ((0, specs_1.isLineSeriesSpec)(spec)) {
            var lineShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
            var lineSeriesStyle = spec.lineSeriesStyle
                ? (0, common_1.mergePartial)(chartTheme.lineSeriesStyle, spec.lineSeriesStyle)
                : chartTheme.lineSeriesStyle;
            var xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode, spec.histogramModeAlignment);
            var renderedLines = (0, line_1.renderLine)((xScale.bandwidth * lineShift) / 2, ds, xScale, yScale, panel, color, spec.curve || curves_1.CurveType.LINEAR, (0, series_1.isBandedSpec)(spec), xScaleOffset, lineSeriesStyle, {
                enabled: spec.markSizeAccessor !== undefined && lineSeriesStyle.point.visible,
                ratio: chartTheme.markSizeRatio,
            }, hasFitFnConfigured(spec.fit), spec.pointStyleAccessor);
            geometriesIndex.merge(renderedLines.indexedGeometryMap);
            lines.push({
                panel: panel,
                value: renderedLines.lineGeometry,
            });
            geometriesCounts.linePoints += renderedLines.lineGeometry.points.length;
            geometriesCounts.lines += 1;
        }
        else if ((0, specs_1.isAreaSeriesSpec)(spec)) {
            var areaShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
            var areaSeriesStyle = spec.areaSeriesStyle
                ? (0, common_1.mergePartial)(chartTheme.areaSeriesStyle, spec.areaSeriesStyle)
                : chartTheme.areaSeriesStyle;
            var xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode, spec.histogramModeAlignment);
            var renderedAreas = (0, area_1.renderArea)((xScale.bandwidth * areaShift) / 2, ds, xScale, yScale, panel, color, spec.curve || curves_1.CurveType.LINEAR, (0, series_1.isBandedSpec)(spec), xScaleOffset, areaSeriesStyle, {
                enabled: spec.markSizeAccessor !== undefined && areaSeriesStyle.point.visible,
                ratio: chartTheme.markSizeRatio,
            }, spec.stackAccessors ? spec.stackAccessors.length > 0 : false, hasFitFnConfigured(spec.fit), spec.pointStyleAccessor);
            geometriesIndex.merge(renderedAreas.indexedGeometryMap);
            areas.push({
                panel: panel,
                value: renderedAreas.areaGeometry,
            });
            geometriesCounts.areasPoints += renderedAreas.areaGeometry.points.length;
            geometriesCounts.areas += 1;
        }
    }
    return {
        geometries: {
            points: points,
            bars: bars,
            areas: areas,
            lines: lines,
            bubbles: bubbles,
        },
        geometriesIndex: geometriesIndex,
        geometriesCounts: geometriesCounts,
    };
}
function computeChartTransform(_a, chartRotation) {
    var width = _a.width, height = _a.height;
    return {
        x: chartRotation === 90 || chartRotation === 180 ? width : 0,
        y: chartRotation === -90 || chartRotation === 180 ? height : 0,
        rotate: chartRotation,
    };
}
exports.computeChartTransform = computeChartTransform;
function hasFitFnConfigured(fit) {
    return Boolean(fit && (fit.type || fit) !== specs_1.Fit.None);
}
function getBarIndexKey(_a, histogramModeEnabled) {
    var spec = _a.spec, specId = _a.specId, groupId = _a.groupId, yAccessor = _a.yAccessor, splitAccessors = _a.splitAccessors;
    var isStacked = (0, y_domain_1.isStackedSpec)(spec, histogramModeEnabled);
    if (isStacked) {
        return [groupId, '__stacked__'].join('__-__');
    }
    return __spreadArray(__spreadArray([groupId, specId], __read(splitAccessors.values()), false), [yAccessor], false).join('__-__');
}
exports.getBarIndexKey = getBarIndexKey;
//# sourceMappingURL=utils.js.map