/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isHorizontalRotation } from './common';
import { getAxesSpecForSpecId, getSpecDomainGroupId, getSpecsById } from './spec';
import { ComputedGeometries, GeometriesCounts, SeriesDomainsAndData, Transform } from './types';
import { Color } from '../../../../common/colors';
import { SmallMultipleScales, SmallMultiplesGroupBy } from '../../../../common/panel_utils';
import { getPredicateFn, Predicate } from '../../../../common/predicate';
import { SeriesIdentifier, SeriesKey } from '../../../../common/series_id';
import { ScaleBand, ScaleContinuous } from '../../../../scales';
import { SettingsSpec, TickFormatter } from '../../../../specs';
import { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isFiniteNumber, isNil, isUniqueArray, mergePartial, Rotation } from '../../../../utils/common';
import { CurveType } from '../../../../utils/curves';
import { Dimensions, Size } from '../../../../utils/dimensions';
import {
  AreaGeometry,
  BarGeometry,
  BubbleGeometry,
  LineGeometry,
  PerPanel,
  PointGeometry,
} from '../../../../utils/geometry';
import { GroupId, SpecId } from '../../../../utils/ids';
import { getRenderingCompareFn } from '../../../../utils/series_sort';
import { ColorConfig, Theme } from '../../../../utils/themes/theme';
import { XDomain } from '../../domains/types';
import { mergeXDomain } from '../../domains/x_domain';
import { isStackedSpec, mergeYDomain } from '../../domains/y_domain';
import { renderArea } from '../../rendering/area';
import { renderBars } from '../../rendering/bars';
import { renderBubble } from '../../rendering/bubble';
import { renderLine } from '../../rendering/line';
import { getAreaSeriesStyles, getLineSeriesStyles } from '../../rendering/line_area_style';
import { defaultXYSeriesSort } from '../../utils/default_series_sort_fn';
import { fillSeries } from '../../utils/fill_series';
import { groupBy } from '../../utils/group_data_series';
import { IndexedGeometryMap } from '../../utils/indexed_geometry_map';
import { computeXScale, computeYScales } from '../../utils/scales';
import {
  DataSeries,
  getDataSeriesFromSpecs,
  getFormattedDataSeries,
  getSeriesKey,
  isBandedSpec,
} from '../../utils/series';
import {
  AnnotationDomainType,
  AnnotationSpec,
  AxisSpec,
  BasicSeriesSpec,
  Fit,
  FitConfig,
  HistogramModeAlignment,
  HistogramModeAlignments,
  isAreaSeriesSpec,
  isBarSeriesSpec,
  isBubbleSeriesSpec,
  isLineAnnotation,
  isLineSeriesSpec,
} from '../../utils/specs';
import { ScaleConfigs } from '../selectors/get_api_scale_configs';

/**
 * Return map association between `seriesKey` and only the custom colors string
 * @internal
 * @param dataSeries
 */
export function getCustomSeriesColors(dataSeries: DataSeries[]): Map<SeriesKey, Color> {
  const updatedCustomSeriesColors = new Map<SeriesKey, Color>();
  const counters = new Map<SpecId, number>();

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
    const seriesKey = getSeriesKey(dataSeriesKey, ds.groupId);

    if (!spec || !spec.color) {
      return;
    }

    let color: Color | undefined | null;

    if (!color && spec.color) {
      if (typeof spec.color === 'string') {
        // eslint-disable-next-line prefer-destructuring
        color = spec.color;
      } else {
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

/**
 * Compute data domains for all specified specs.
 * @internal
 */
export function computeSeriesDomains(
  seriesSpecs: BasicSeriesSpec[],
  scaleConfigs: ScaleConfigs,
  annotations: AnnotationSpec[],
  settingsSpec: Pick<SettingsSpec, 'orderOrdinalBinsBy' | 'locale'>,
  deselectedDataSeries: SeriesIdentifier[] = [],
  smallMultiples?: SmallMultiplesGroupBy,
): SeriesDomainsAndData {
  const { orderOrdinalBinsBy, locale } = settingsSpec;
  const { dataSeries, xValues, fallbackScale, smHValues, smVValues } = getDataSeriesFromSpecs(
    seriesSpecs,
    deselectedDataSeries,
    orderOrdinalBinsBy,
    smallMultiples,
  );
  // compute the x domain merging any custom domain
  const xDomain = mergeXDomain(scaleConfigs.x, xValues, locale, fallbackScale);

  // fill series with missing x values
  const filledDataSeries = fillSeries(dataSeries, xValues, xDomain.type);

  const seriesSortFn = getRenderingCompareFn((a: SeriesIdentifier, b: SeriesIdentifier) => {
    return defaultXYSeriesSort(a as DataSeries, b as DataSeries);
  });

  const formattedDataSeries = getFormattedDataSeries(seriesSpecs, filledDataSeries, xValues, xDomain.type).sort(
    seriesSortFn,
  );
  const annotationYValueMap = getAnnotationYValueMap(annotations, scaleConfigs.y);

  // let's compute the yDomains after computing all stacked values
  const yDomains = mergeYDomain(scaleConfigs.y, formattedDataSeries, annotationYValueMap);

  // sort small multiples values
  const horizontalPredicate = smallMultiples?.horizontal?.sort ?? Predicate.DataIndex;
  const smHDomain = [...smHValues].sort(getPredicateFn(horizontalPredicate, locale));

  const verticalPredicate = smallMultiples?.vertical?.sort ?? Predicate.DataIndex;
  const smVDomain = [...smVValues].sort(getPredicateFn(verticalPredicate, locale));

  return {
    xDomain,
    yDomains,
    smHDomain,
    smVDomain,
    formattedDataSeries,
  };
}

function getAnnotationYValueMap(
  annotations: AnnotationSpec[],
  yScaleConfig: ScaleConfigs['y'],
): Map<GroupId, number[]> {
  return annotations.reduce((acc, spec) => {
    const { includeDataFromIds = [] } = yScaleConfig[spec.groupId]?.customDomain ?? {};
    if (!includeDataFromIds.includes(spec.id)) return acc.set(spec.groupId, []);
    const yValues: number[] = isLineAnnotation(spec)
      ? spec.domainType === AnnotationDomainType.YDomain
        ? spec.dataValues.map(({ dataValue }) => dataValue)
        : []
      : spec.dataValues.flatMap(({ coordinates: { y0, y1 } }) => [y0, y1]);
    const groupValues = acc.get(spec.groupId) ?? [];
    return acc.set(spec.groupId, [...groupValues, ...yValues.filter(isFiniteNumber)]);
  }, new Map<GroupId, number[]>());
}

/** @internal */
export function computeSeriesGeometries(
  seriesSpecs: BasicSeriesSpec[],
  { xDomain, yDomains, formattedDataSeries: nonFilteredDataSeries }: SeriesDomainsAndData,
  seriesColorMap: Map<SeriesKey, Color>,
  chartTheme: Theme,
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  axesSpecs: AxisSpec[],
  smallMultiplesScales: SmallMultipleScales,
  enableHistogramMode: boolean,
  fallbackTickFormatter: TickFormatter,
  measureText: TextMeasure,
): ComputedGeometries {
  const chartColors: ColorConfig = chartTheme.colors;
  const formattedDataSeries = nonFilteredDataSeries.filter(({ isFiltered }) => !isFiltered);
  const barDataSeries = formattedDataSeries.filter(({ spec }) => isBarSeriesSpec(spec));
  // compute max bar in cluster per panel
  const dataSeriesGroupedByPanel = groupBy(
    barDataSeries,
    ['smVerticalAccessorValue', 'smHorizontalAccessorValue'],
    false,
  );

  const barIndexByPanel = Object.keys(dataSeriesGroupedByPanel).reduce<Record<string, string[]>>((acc, panelKey) => {
    const panelBars = dataSeriesGroupedByPanel[panelKey] ?? [];
    const barDataSeriesByBarIndex = groupBy(panelBars, getBarIndexKey, false);
    acc[panelKey] = Object.keys(barDataSeriesByBarIndex);
    return acc;
  }, {});

  const { horizontal, vertical } = smallMultiplesScales;

  const yScales = computeYScales({
    yDomains,
    range: [isHorizontalRotation(chartRotation) ? vertical.bandwidth : horizontal.bandwidth, 0],
  });

  const computedGeoms = renderGeometries(
    formattedDataSeries,
    xDomain,
    yScales,
    vertical,
    horizontal,
    barIndexByPanel,
    seriesSpecs,
    seriesColorMap,
    chartColors.defaultVizColor,
    axesSpecs,
    chartTheme,
    enableHistogramMode,
    chartRotation,
    fallbackTickFormatter,
    measureText,
  );

  const totalBarsInCluster = Object.values(barIndexByPanel).reduce((acc, curr) => Math.max(acc, curr.length), 0);

  const xScale = computeXScale({
    xDomain,
    totalBarsInCluster,
    range: [0, isHorizontalRotation(chartRotation) ? horizontal.bandwidth : vertical.bandwidth],
    barsPadding: enableHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding,
    enableHistogramMode,
  });

  return { scales: { xScale, yScales }, ...computedGeoms };
}

/** @internal */
export function setBarSeriesAccessors(isHistogramMode: boolean, seriesSpecs: Map<SpecId, BasicSeriesSpec>): void {
  if (isHistogramMode) {
    for (const [, spec] of seriesSpecs) {
      if (isBarSeriesSpec(spec))
        spec.stackAccessors = [...(spec.stackAccessors || spec.yAccessors), ...(spec.splitSeriesAccessors || [])];
    }
  }
}

/** @internal */
export function isHistogramModeEnabled(seriesSpecs: BasicSeriesSpec[]): boolean {
  return seriesSpecs.some((spec) => isBarSeriesSpec(spec) && spec.enableHistogramMode);
}

/** @internal */
export function computeXScaleOffset(
  xScale: ScaleBand | ScaleContinuous,
  enableHistogramMode: boolean,
  histogramModeAlignment: HistogramModeAlignment = HistogramModeAlignments.Start,
): number {
  if (!enableHistogramMode) {
    return 0;
  }

  const { bandwidth, barsPadding } = xScale;
  const band = bandwidth / (1 - barsPadding);
  const halfPadding = (band - bandwidth) / 2;

  const startAlignmentOffset = bandwidth / 2 + halfPadding;

  switch (histogramModeAlignment) {
    case HistogramModeAlignments.Center:
      return 0;
    case HistogramModeAlignments.End:
      return -startAlignmentOffset;
    default:
      return startAlignmentOffset;
  }
}

function renderGeometries(
  dataSeries: DataSeries[],
  xDomain: XDomain,
  yScales: Map<GroupId, ScaleContinuous>,
  smVScale: ScaleBand,
  smHScale: ScaleBand,
  barIndexOrderPerPanel: Record<string, string[]>,
  seriesSpecs: BasicSeriesSpec[],
  seriesColorsMap: Map<SeriesKey, Color>,
  defaultColor: string,
  axesSpecs: AxisSpec[],
  chartTheme: Theme,
  enableHistogramMode: boolean,
  chartRotation: Rotation,
  fallBackTickFormatter: TickFormatter,
  measureText: TextMeasure,
): Omit<ComputedGeometries, 'scales'> {
  const points: PointGeometry[] = [];
  const bars: Array<PerPanel<BarGeometry[]>> = [];
  const areas: Array<PerPanel<AreaGeometry>> = [];
  const lines: Array<PerPanel<LineGeometry>> = [];
  const bubbles: Array<PerPanel<BubbleGeometry>> = [];
  const geometriesIndex = new IndexedGeometryMap();
  const isMixedChart = isUniqueArray(seriesSpecs, ({ seriesType }) => seriesType) && seriesSpecs.length > 1;
  const geometriesCounts: GeometriesCounts = {
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
    const spec = getSpecsById<BasicSeriesSpec>(seriesSpecs, ds.specId);
    if (spec === undefined) {
      return;
    }
    // compute the y scale
    const yScale = yScales.get(getSpecDomainGroupId(ds.spec));
    if (!yScale) {
      return;
    }
    // compute the panel unique key
    const barPanelKey = [ds.smVerticalAccessorValue, ds.smHorizontalAccessorValue].join('|');
    const barIndexOrder = barIndexOrderPerPanel[barPanelKey] ?? [];
    // compute x scale
    const xScale = computeXScale({
      xDomain,
      totalBarsInCluster: barIndexOrder?.length ?? 0,
      range: [0, isHorizontalRotation(chartRotation) ? smHScale.bandwidth : smVScale.bandwidth],
      barsPadding,
      enableHistogramMode,
    });

    const { stackMode } = ds;

    const leftPos = (!isNil(ds.smHorizontalAccessorValue) && smHScale.scale(ds.smHorizontalAccessorValue)) || 0;
    const topPos = (!isNil(ds.smVerticalAccessorValue) && smVScale.scale(ds.smVerticalAccessorValue)) || 0;
    const panel: Dimensions = {
      width: smHScale.bandwidth,
      height: smVScale.bandwidth,
      top: topPos,
      left: leftPos,
    };
    const dataSeriesKey = getSeriesKey(
      {
        specId: ds.specId,
        yAccessor: ds.yAccessor,
        splitAccessors: ds.splitAccessors,
      },
      ds.groupId,
    );

    const color = seriesColorsMap.get(dataSeriesKey) || defaultColor;

    if (isBarSeriesSpec(spec)) {
      const shift = barIndexOrder.indexOf(getBarIndexKey(ds));

      if (shift === -1) return; // skip bar dataSeries if index is not available

      const barSeriesStyle = mergePartial(chartTheme.barSeriesStyle, spec.barSeriesStyle);
      const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, chartRotation);
      const valueFormatter = yAxis?.tickFormat ?? fallBackTickFormatter;

      const displayValueSettings = spec.displayValueSettings
        ? { valueFormatter, ...spec.displayValueSettings }
        : undefined;

      const renderedBars = renderBars(
        measureText,
        shift,
        ds,
        xScale,
        yScale,
        panel,
        chartRotation,
        spec.minBarHeight ?? 0,
        color,
        isBandedSpec(spec),
        barSeriesStyle,
        displayValueSettings,
        spec.styleAccessor,
        stackMode,
      );
      geometriesIndex.merge(renderedBars.indexedGeometryMap);
      bars.push({ panel, value: renderedBars.barGeometries });
      geometriesCounts.bars += renderedBars.barGeometries.length;
    } else if (isBubbleSeriesSpec(spec)) {
      const bubbleShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
      const bubbleSeriesStyle = spec.bubbleSeriesStyle
        ? mergePartial(chartTheme.bubbleSeriesStyle, spec.bubbleSeriesStyle)
        : chartTheme.bubbleSeriesStyle;
      const xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode);
      const renderedBubbles = renderBubble(
        (xScale.bandwidth * bubbleShift) / 2,
        ds,
        xScale,
        yScale,
        color,
        panel,
        isBandedSpec(spec),
        xScaleOffset,
        bubbleSeriesStyle,
        {
          enabled: spec.markSizeAccessor !== undefined,
          ratio: chartTheme.markSizeRatio,
        },
        isMixedChart,
        spec.pointStyleAccessor,
      );
      geometriesIndex.merge(renderedBubbles.indexedGeometryMap);
      bubbles.push({
        panel,
        value: renderedBubbles.bubbleGeometry,
      });
      geometriesCounts.bubblePoints += renderedBubbles.bubbleGeometry.points.length;
      geometriesCounts.bubbles += 1;
    } else if (isLineSeriesSpec(spec)) {
      const lineShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
      const lineSeriesStyle = getLineSeriesStyles(chartTheme.lineSeriesStyle, spec.lineSeriesStyle);
      const xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode, spec.histogramModeAlignment);

      const renderedLines = renderLine(
        // move the point on half of the bandwidth if we have mixed bars/lines
        (xScale.bandwidth * lineShift) / 2,
        ds,
        xScale,
        yScale,
        panel,
        color,
        spec.curve || CurveType.LINEAR,
        isBandedSpec(spec),
        xScaleOffset,
        lineSeriesStyle,
        {
          enabled: spec.markSizeAccessor !== undefined && lineSeriesStyle.point.visible,
          ratio: chartTheme.markSizeRatio,
        },
        hasFitFnConfigured(spec.fit),
        spec.pointStyleAccessor,
      );

      geometriesIndex.merge(renderedLines.indexedGeometryMap);
      lines.push({
        panel,
        value: renderedLines.lineGeometry,
      });
      geometriesCounts.linePoints += renderedLines.lineGeometry.points.length;
      geometriesCounts.lines += 1;
    } else if (isAreaSeriesSpec(spec)) {
      const areaShift = barIndexOrder && barIndexOrder.length > 0 ? barIndexOrder.length : 1;
      const areaSeriesStyle = getAreaSeriesStyles(chartTheme.areaSeriesStyle, spec.areaSeriesStyle);
      const xScaleOffset = computeXScaleOffset(xScale, enableHistogramMode, spec.histogramModeAlignment);
      const renderedAreas = renderArea(
        // move the point on half of the bandwidth if we have mixed bars/lines
        (xScale.bandwidth * areaShift) / 2,
        ds,
        xScale,
        yScale,
        panel,
        color,
        spec.curve || CurveType.LINEAR,
        isBandedSpec(spec),
        xScaleOffset,
        areaSeriesStyle,
        {
          enabled: spec.markSizeAccessor !== undefined && areaSeriesStyle.point.visible,
          ratio: chartTheme.markSizeRatio,
        },
        spec.stackAccessors ? spec.stackAccessors.length > 0 : false,
        hasFitFnConfigured(spec.fit),
        spec.pointStyleAccessor,
      );
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

/** @internal */
export function computeChartTransform({ width, height }: Size, chartRotation: Rotation): Transform {
  return {
    x: chartRotation === 90 || chartRotation === 180 ? width : 0,
    y: chartRotation === -90 || chartRotation === 180 ? height : 0,
    rotate: chartRotation,
  };
}

function hasFitFnConfigured(fit?: Fit | FitConfig) {
  return Boolean(fit && ((fit as FitConfig).type || fit) !== Fit.None);
}

/** @internal */
export function getBarIndexKey({ spec, specId, groupId, yAccessor, splitAccessors }: DataSeries): string {
  if (isStackedSpec(spec)) {
    return [groupId, '__stacked__'].join('__-__');
  }

  return [groupId, specId, ...splitAccessors.values(), yAccessor].join('__-__');
}
