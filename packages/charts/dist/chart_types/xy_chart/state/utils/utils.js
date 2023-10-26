"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarIndexKey = exports.computeChartTransform = exports.computeXScaleOffset = exports.isHistogramModeEnabled = exports.setBarSeriesAccessors = exports.computeSeriesGeometries = exports.computeSeriesDomains = exports.getCustomSeriesColors = void 0;
const common_1 = require("./common");
const spec_1 = require("./spec");
const predicate_1 = require("../../../../common/predicate");
const common_2 = require("../../../../utils/common");
const curves_1 = require("../../../../utils/curves");
const series_sort_1 = require("../../../../utils/series_sort");
const x_domain_1 = require("../../domains/x_domain");
const y_domain_1 = require("../../domains/y_domain");
const area_1 = require("../../rendering/area");
const bars_1 = require("../../rendering/bars");
const bubble_1 = require("../../rendering/bubble");
const line_1 = require("../../rendering/line");
const default_series_sort_fn_1 = require("../../utils/default_series_sort_fn");
const fill_series_1 = require("../../utils/fill_series");
const group_data_series_1 = require("../../utils/group_data_series");
const indexed_geometry_map_1 = require("../../utils/indexed_geometry_map");
const scales_1 = require("../../utils/scales");
const series_1 = require("../../utils/series");
const specs_1 = require("../../utils/specs");
function getCustomSeriesColors(dataSeries) {
    const updatedCustomSeriesColors = new Map();
    const counters = new Map();
    dataSeries.forEach((ds) => {
        const { spec, specId } = ds;
        const dataSeriesKey = {
            specId: ds.specId,
            xAccessor: ds.xAccessor,
            yAccessor: ds.yAccessor,
            splitAccessors: ds.splitAccessors,
            smVerticalAccessorValue: undefined,
            smHorizontalAccessorValue: undefined,
        };
        const seriesKey = (0, series_1.getSeriesKey)(dataSeriesKey, ds.groupId);
        if (!spec || !spec.color) {
            return;
        }
        let color;
        if (!color && spec.color) {
            if (typeof spec.color === 'string') {
                color = spec.color;
            }
            else {
                const counter = counters.get(specId) || 0;
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
function computeSeriesDomains(seriesSpecs, scaleConfigs, annotations, settingsSpec, deselectedDataSeries = [], smallMultiples) {
    var _a, _b, _c, _d;
    const { orderOrdinalBinsBy, locale } = settingsSpec;
    const { dataSeries, xValues, fallbackScale, smHValues, smVValues } = (0, series_1.getDataSeriesFromSpecs)(seriesSpecs, deselectedDataSeries, orderOrdinalBinsBy, smallMultiples);
    const xDomain = (0, x_domain_1.mergeXDomain)(scaleConfigs.x, xValues, locale, fallbackScale);
    const filledDataSeries = (0, fill_series_1.fillSeries)(dataSeries, xValues, xDomain.type);
    const seriesSortFn = (0, series_sort_1.getRenderingCompareFn)((a, b) => {
        return (0, default_series_sort_fn_1.defaultXYSeriesSort)(a, b);
    });
    const formattedDataSeries = (0, series_1.getFormattedDataSeries)(seriesSpecs, filledDataSeries, xValues, xDomain.type).sort(seriesSortFn);
    const annotationYValueMap = getAnnotationYValueMap(annotations, scaleConfigs.y);
    const yDomains = (0, y_domain_1.mergeYDomain)(scaleConfigs.y, formattedDataSeries, annotationYValueMap);
    const horizontalPredicate = (_b = (_a = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.horizontal) === null || _a === void 0 ? void 0 : _a.sort) !== null && _b !== void 0 ? _b : predicate_1.Predicate.DataIndex;
    const smHDomain = [...smHValues].sort((0, predicate_1.getPredicateFn)(horizontalPredicate, locale));
    const verticalPredicate = (_d = (_c = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.vertical) === null || _c === void 0 ? void 0 : _c.sort) !== null && _d !== void 0 ? _d : predicate_1.Predicate.DataIndex;
    const smVDomain = [...smVValues].sort((0, predicate_1.getPredicateFn)(verticalPredicate, locale));
    return {
        xDomain,
        yDomains,
        smHDomain,
        smVDomain,
        formattedDataSeries,
    };
}
exports.computeSeriesDomains = computeSeriesDomains;
function getAnnotationYValueMap(annotations, yScaleConfig) {
    return annotations.reduce((acc, spec) => {
        var _a, _b, _c;
        const { includeDataFromIds = [] } = (_b = (_a = yScaleConfig[spec.groupId]) === null || _a === void 0 ? void 0 : _a.customDomain) !== null && _b !== void 0 ? _b : {};
        if (!includeDataFromIds.includes(spec.id))
            return acc.set(spec.groupId, []);
        const yValues = (0, specs_1.isLineAnnotation)(spec)
            ? spec.domainType === specs_1.AnnotationDomainType.YDomain
                ? spec.dataValues.map(({ dataValue }) => dataValue)
                : []
            : spec.dataValues.flatMap(({ coordinates: { y0, y1 } }) => [y0, y1]);
        const groupValues = (_c = acc.get(spec.groupId)) !== null && _c !== void 0 ? _c : [];
        return acc.set(spec.groupId, [...groupValues, ...yValues.filter(common_2.isFiniteNumber)]);
    }, new Map());
}
function computeSeriesGeometries(seriesSpecs, { xDomain, yDomains, formattedDataSeries: nonFilteredDataSeries }, seriesColorMap, chartTheme, { rotation: chartRotation }, axesSpecs, smallMultiplesScales, enableHistogramMode, fallbackTickFormatter, measureText) {
    const chartColors = chartTheme.colors;
    const formattedDataSeries = nonFilteredDataSeries.filter(({ isFiltered }) => !isFiltered);
    const barDataSeries = formattedDataSeries.filter(({ spec }) => (0, specs_1.isBarSeriesSpec)(spec));
    const dataSeriesGroupedByPanel = (0, group_data_series_1.groupBy)(barDataSeries, ['smVerticalAccessorValue', 'smHorizontalAccessorValue'], false);
    const barIndexByPanel = Object.keys(dataSeriesGroupedByPanel).reduce((acc, panelKey) => {
        var _a;
        const panelBars = (_a = dataSeriesGroupedByPanel[panelKey]) !== null && _a !== void 0 ? _a : [];
        const barDataSeriesByBarIndex = (0, group_data_series_1.groupBy)(panelBars, (d) => getBarIndexKey(d, enableHistogramMode), false);
        acc[panelKey] = Object.keys(barDataSeriesByBarIndex);
        return acc;
    }, {});
    const { horizontal, vertical } = smallMultiplesScales;
    const yScales = (0, scales_1.computeYScales)({
        yDomains,
        range: [(0, common_1.isHorizontalRotation)(chartRotation) ? vertical.bandwidth : horizontal.bandwidth, 0],
    });
    const computedGeoms = renderGeometries(formattedDataSeries, xDomain, yScales, vertical, horizontal, barIndexByPanel, seriesSpecs, seriesColorMap, chartColors.defaultVizColor, axesSpecs, chartTheme, enableHistogramMode, chartRotation, fallbackTickFormatter, measureText);
    const totalBarsInCluster = Object.values(barIndexByPanel).reduce((acc, curr) => Math.max(acc, curr.length), 0);
    const xScale = (0, scales_1.computeXScale)({
        xDomain,
        totalBarsInCluster,
        range: [0, (0, common_1.isHorizontalRotation)(chartRotation) ? horizontal.bandwidth : vertical.bandwidth],
        barsPadding: enableHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding,
        enableHistogramMode,
    });
    return { scales: { xScale, yScales }, ...computedGeoms };
}
exports.computeSeriesGeometries = computeSeriesGeometries;
function setBarSeriesAccessors(isHistogramMode, seriesSpecs) {
    if (isHistogramMode) {
        for (const [, spec] of seriesSpecs) {
            if ((0, specs_1.isBarSeriesSpec)(spec))
                spec.stackAccessors = [...(spec.stackAccessors || spec.yAccessors), ...(spec.splitSeriesAccessors || [])];
        }
    }
}
exports.setBarSeriesAccessors = setBarSeriesAccessors;
function isHistogramModeEnabled(seriesSpecs) {
    return seriesSpecs.some((spec) => (0, specs_1.isBarSeriesSpec)(spec) && spec.enableHistogramMode);
}
exports.isHistogramModeEnabled = isHistogramModeEnabled;
function computeXScaleOffset(xScale, enableHistogramMode, histogramModeAlignment = specs_1.HistogramModeAlignments.Start) {
    if (!enableHistogramMode) {
        return 0;
    }
    const { bandwidth, barsPadding } = xScale;
    const band = bandwidth / (1 - barsPadding);
    const halfPadding = (band - bandwidth) / 2;
    const startAlignmentOffset = bandwidth / 2 + halfPadding;
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
    const points = [];
    const bars = [];
    const areas = [];
    const lines = [];
    const bubbles = [];
    const geometriesIndex = new indexed_geometry_map_1.IndexedGeometryMap();
    const isMixedChart = (0, common_2.isUniqueArray)(seriesSpecs, ({ seriesType }) => seriesType) && seriesSpecs.length > 1;
    const geometriesCounts = {
        points: 0,
        bars: 0,
        areas: 0,
        areasPoints: 0,
        lines: 0,
        linePoints: 0,
        bubbles: 0,
        bubblePoints: 0,
    };
    const barsPadding = enableHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding;
    dataSeries.forEach((ds) => {
        var _a, _b, _c, _d;
        const spec = (0, spec_1.getSpecsById)(seriesSpecs, ds.specId);
        if (spec === undefined) {
            return;
        }
        const yScale = yScales.get((0, spec_1.getSpecDomainGroupId)(ds.spec));
        if (!yScale) {
            return;
        }
        const barPanelKey = [ds.smVerticalAccessorValue, ds.smHorizontalAccessorValue].join('|');
        const barIndexOrder = (_a = barIndexOrderPerPanel[barPanelKey]) !== null && _a !== void 0 ? _a : [];
        const xScale = (0, scales_1.computeXScale)({
            xDomain,
            totalBarsInCluster: (_b = barIndexOrder === null || barIndexOrder === void 0 ? void 0 : barIndexOrder.length) !== null && _b !== void 0 ? _b : 0,
            range: [0, (0, common_1.isHorizontalRotation)(chartRotation) ? smHScale.bandwidth : smVScale.bandwidth],
            barsPadding,
            enableHistogramMode,
        });
        const { stackMode } = ds;
        const leftPos = (!(0, common_2.isNil)(ds.smHorizontalAccessorValue) && smHScale.scale(ds.smHorizontalAccessorValue)) || 0;
        const topPos = (!(0, common_2.isNil)(ds.smVerticalAccessorValue) && smVScale.scale(ds.smVerticalAccessorValue)) || 0;
        const panel = {
            width: smHScale.bandwidth,
            height: smVScale.bandwidth,
            top: topPos,
            left: leftPos,
        };
        const dataSeriesKey = (0, series_1.getSeriesKey)({
            specId: ds.specId,
            yAccessor: ds.yAccessor,
            splitAccessors: ds.splitAccessors,
        }, ds.groupId);
        const color = seriesColorsMap.get(dataSeriesKey) || defaultColor;
        if ((0, specs_1.isBarSeriesSpec)(spec)) {
            const shift = barIndexOrder.indexOf(getBarIndexKey(ds, enableHistogramMode));
            if (shift === -1)
                return;
            const barSeriesStyle = (0, common_2.mergePartial)(chartTheme.barSeriesStyle, spec.barSeriesStyle);
            const { yAxis } = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, spec.groupId, chartRotation);
            const valueFormatter = (_c = yAxis === null || yAxis === void 0 ? void 0 : yAxis.tickFormat) !== null && _c !== void 0 ? _c : fallBackTickFormatter;
            const displayValueSettings = spec.displayValueSettings
                ? { valueFormatter, ...spec.displayValueSettings }
                : undefined;
            const renderedBars = (0, bars_1.renderBars)(measureText, shift, ds, xScale, yScale, panel, chartRotation, (_d = spec.minBarHeight) !== null && _d !== void 0 ? _d : 0, color, barSeriesStyle, displayValueSettings, spec.styleAccessor, stackMode);
            geometriesIndex.merge(renderedBars.indexedGeometryMap);
            bars.push({ panel, value: renderedBars.barGeometries });
            geometriesCounts.bars += renderedBars.barGeometries.length;
        }
        else if ((0, specs_1.isBubbleSeriesSpec)(spec)) {
            const bubbleShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
            const bubbleSeriesStyle = spec.bubbleSeriesStyle
                ? (0, common_2.mergePartial)(chartTheme.bubbleSeriesStyle, spec.bubbleSeriesStyle)
                : chartTheme.bubbleSeriesStyle;
            const xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode);
            const renderedBubbles = (0, bubble_1.renderBubble)((xScale.bandwidth * bubbleShift) / 2, ds, xScale, yScale, color, panel, (0, series_1.isBandedSpec)(spec), xScaleOffset, bubbleSeriesStyle, {
                enabled: spec.markSizeAccessor !== undefined,
                ratio: chartTheme.markSizeRatio,
            }, isMixedChart, spec.pointStyleAccessor);
            geometriesIndex.merge(renderedBubbles.indexedGeometryMap);
            bubbles.push({
                panel,
                value: renderedBubbles.bubbleGeometry,
            });
            geometriesCounts.bubblePoints += renderedBubbles.bubbleGeometry.points.length;
            geometriesCounts.bubbles += 1;
        }
        else if ((0, specs_1.isLineSeriesSpec)(spec)) {
            const lineShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
            const lineSeriesStyle = spec.lineSeriesStyle
                ? (0, common_2.mergePartial)(chartTheme.lineSeriesStyle, spec.lineSeriesStyle)
                : chartTheme.lineSeriesStyle;
            const xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode, spec.histogramModeAlignment);
            const renderedLines = (0, line_1.renderLine)((xScale.bandwidth * lineShift) / 2, ds, xScale, yScale, panel, color, spec.curve || curves_1.CurveType.LINEAR, (0, series_1.isBandedSpec)(spec), xScaleOffset, lineSeriesStyle, {
                enabled: spec.markSizeAccessor !== undefined && lineSeriesStyle.point.visible,
                ratio: chartTheme.markSizeRatio,
            }, hasFitFnConfigured(spec.fit), spec.pointStyleAccessor);
            geometriesIndex.merge(renderedLines.indexedGeometryMap);
            lines.push({
                panel,
                value: renderedLines.lineGeometry,
            });
            geometriesCounts.linePoints += renderedLines.lineGeometry.points.length;
            geometriesCounts.lines += 1;
        }
        else if ((0, specs_1.isAreaSeriesSpec)(spec)) {
            const areaShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
            const areaSeriesStyle = spec.areaSeriesStyle
                ? (0, common_2.mergePartial)(chartTheme.areaSeriesStyle, spec.areaSeriesStyle)
                : chartTheme.areaSeriesStyle;
            const xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode, spec.histogramModeAlignment);
            const renderedAreas = (0, area_1.renderArea)((xScale.bandwidth * areaShift) / 2, ds, xScale, yScale, panel, color, spec.curve || curves_1.CurveType.LINEAR, (0, series_1.isBandedSpec)(spec), xScaleOffset, areaSeriesStyle, {
                enabled: spec.markSizeAccessor !== undefined && areaSeriesStyle.point.visible,
                ratio: chartTheme.markSizeRatio,
            }, spec.stackAccessors ? spec.stackAccessors.length > 0 : false, hasFitFnConfigured(spec.fit), spec.pointStyleAccessor);
            geometriesIndex.merge(renderedAreas.indexedGeometryMap);
            areas.push({
                panel,
                value: renderedAreas.areaGeometry,
            });
            geometriesCounts.areasPoints += renderedAreas.areaGeometry.points.length;
            geometriesCounts.areas += 1;
        }
    });
    return {
        geometries: {
            points,
            bars,
            areas,
            lines,
            bubbles,
        },
        geometriesIndex,
        geometriesCounts,
    };
}
function computeChartTransform({ width, height }, chartRotation) {
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
function getBarIndexKey({ spec, specId, groupId, yAccessor, splitAccessors }, histogramModeEnabled) {
    const isStacked = (0, y_domain_1.isStackedSpec)(spec, histogramModeEnabled);
    if (isStacked) {
        return [groupId, '__stacked__'].join('__-__');
    }
    return [groupId, specId, ...splitAccessors.values(), yAccessor].join('__-__');
}
exports.getBarIndexKey = getBarIndexKey;
//# sourceMappingURL=utils.js.map