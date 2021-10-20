/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale, ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { AxisSpec, SettingsSpec, TickFormatter, TickFormatterOptions } from '../../../../specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { Position, Rotation } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { AxisId } from '../../../../utils/ids';
import { rasters, TimeBin, TimeRaster } from '../../axes/timeslip/rasters';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import {
  AxisTick,
  defaultTickFormatter,
  isXDomain,
  TickLabelBounds,
  TIME_AXIS_LAYER_COUNT,
} from '../../utils/axis_utils';
import { getPanelSize } from '../../utils/panel';
import { computeXScale } from '../../utils/scales';
import { SeriesDomainsAndData } from '../utils/types';
import {
  getFallBackTickFormatter,
  getJoinedVisibleAxesData,
  getLabelBox,
  JoinedAxisData,
} from './compute_axis_ticks_dimensions';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { computeSmallMultipleScalesSelector, SmallMultipleScales } from './compute_small_multiple_scales';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getBarPaddingsSelector } from './get_bar_paddings';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

/** @internal */
export type Projection = { ticks: AxisTick[]; labelBox: TickLabelBounds; scale: Scale<string | number> };

type Projections = Map<AxisId, Projection>;

const adaptiveTickCount = true;

function axisMinMax(axisPosition: Position, chartRotation: Rotation, { width, height }: Size): [number, number] {
  const horizontal = isHorizontalAxis(axisPosition);
  const flipped = horizontal
    ? chartRotation === -90 || chartRotation === 180
    : chartRotation === 90 || chartRotation === 180;
  return horizontal ? [flipped ? width : 0, flipped ? 0 : width] : [flipped ? 0 : height, flipped ? height : 0];
}

/** @internal */
export function enableDuplicatedTicks(
  axisSpec: AxisSpec,
  scale: Scale<number | string>,
  offset: number,
  fallBackTickFormatter: TickFormatter,
  tickFormatOptions: TickFormatterOptions,
  layer: number,
): AxisTick[] {
  const labelFormat =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tickFormatOptions.labelFormat ?? axisSpec.labelFormat ?? axisSpec.tickFormat ?? fallBackTickFormatter;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ticks = tickFormatOptions.timeTicks ?? scale.ticks();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return ticks.map((value) => ({
    value,
    label: (axisSpec.tickFormat ?? fallBackTickFormatter)(value, tickFormatOptions),
    axisTickLabel: labelFormat(value, tickFormatOptions),
    position: (scale.scale(value) || 0) + offset, // todo it doesn't look desirable to convert a NaN into a zero
    layer,
  }));
}

function getVisibleTicks(
  axisSpec: AxisSpec,
  labelBox: TickLabelBounds,
  totalBarsInCluster: number,
  fallBackTickFormatter: TickFormatter,
  rotationOffset: number,
  scale: Scale<number | string>,
  enableHistogramMode: boolean,
  tickFormatOptions: TickFormatterOptions,
  layer: number,
  ticks: (number | string)[],
): AxisTick[] {
  const isSingleValueScale = scale.domain[0] === scale.domain[1];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isMultilayerTimeAxis = Boolean(tickFormatOptions.timeTicks); // fixme this HORRIBLE temporary inference
  const makeRaster = enableHistogramMode && scale.bandwidth > 0 && !isMultilayerTimeAxis;
  const ultimateTick = ticks[ticks.length - 1];
  const penultimateTick = ticks[ticks.length - 2];
  if (makeRaster && !isSingleValueScale && typeof penultimateTick === 'number' && typeof ultimateTick === 'number') {
    const computedTickDistance = ultimateTick - penultimateTick;
    const numTicks = scale.minInterval / (computedTickDistance || scale.minInterval); // avoid infinite loop
    for (let i = 1; i <= numTicks; i++) ticks.push(i * computedTickDistance + ultimateTick);
  }
  const shift = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
  const band = scale.bandwidth / (1 - scale.barsPadding);
  const halfPadding = (band - scale.bandwidth) / 2;
  const offset =
    (enableHistogramMode ? -halfPadding : (scale.bandwidth * shift) / 2) + (scale.isSingleValue() ? 0 : rotationOffset);
  const tickFormatter = axisSpec.tickFormat ?? fallBackTickFormatter;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const labelFormatter = tickFormatOptions.labelFormat ?? axisSpec.labelFormat ?? tickFormatter;
  const firstTickValue = ticks[0];
  const allTicks: AxisTick[] =
    makeRaster && isSingleValueScale && typeof firstTickValue === 'number'
      ? [
          {
            value: firstTickValue,
            label: tickFormatter(firstTickValue, tickFormatOptions),
            axisTickLabel: labelFormatter(firstTickValue, tickFormatOptions),
            position: (scale.scale(firstTickValue) || 0) + offset,
            layer: 0, // no multiple layers with `singleValueScale`s
          },
          {
            value: firstTickValue + scale.minInterval,
            label: tickFormatter(firstTickValue + scale.minInterval, tickFormatOptions),
            axisTickLabel: labelFormatter(firstTickValue + scale.minInterval, tickFormatOptions),
            position: scale.bandwidth + halfPadding * 2,
            layer: 0, // no multiple layers with `singleValueScale`s
          },
        ]
      : enableDuplicatedTicks(axisSpec, scale, offset, fallBackTickFormatter, tickFormatOptions, layer);

  const { showOverlappingTicks, showOverlappingLabels, position } = axisSpec;
  const requiredSpace = isVerticalAxis(position) ? labelBox.maxLabelBboxHeight / 2 : labelBox.maxLabelBboxWidth / 2;
  return showOverlappingLabels || isMultilayerTimeAxis
    ? allTicks
    : [...allTicks]
        .sort((a: AxisTick, b: AxisTick) => a.position - b.position)
        .reduce(
          (prev, tick) => {
            const tickLabelFits = tick.position >= prev.occupiedSpace + requiredSpace;
            if (tickLabelFits || showOverlappingTicks) {
              prev.visibleTicks.push(tickLabelFits ? tick : { ...tick, axisTickLabel: '' });
              if (tickLabelFits) prev.occupiedSpace = tick.position + requiredSpace;
            } else if (adaptiveTickCount && !tickLabelFits && !showOverlappingTicks) {
              prev.visibleTicks.push({ ...tick, axisTickLabel: '' });
            }
            return prev;
          },
          { visibleTicks: [] as AxisTick[], occupiedSpace: -Infinity },
        ).visibleTicks;
}

function getVisibleTickSet(
  scale: Scale<number | string>,
  labelBox: TickLabelBounds,
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  axisSpec: AxisSpec,
  { xDomain: { timeZone } }: Pick<SeriesDomainsAndData, 'xDomain'>,
  groupCount: number,
  histogramMode: boolean,
  fallBackTickFormatter: TickFormatter,
  layer: number,
  ticks: (number | string)[],
  options: Record<string, unknown>,
): AxisTick[] {
  const vertical = isVerticalAxis(axisSpec.position);
  const tickFormatter = vertical ? fallBackTickFormatter : defaultTickFormatter;
  const somehowRotated = (vertical && chartRotation === -90) || (!vertical && chartRotation === 180);
  const rotationOffset = histogramMode && somehowRotated ? scale.step : 0; // todo find the true cause of the this offset issue
  const tickFormatOptions = { timeZone, ...options };
  return getVisibleTicks(
    axisSpec,
    labelBox,
    groupCount,
    tickFormatter,
    rotationOffset,
    scale,
    histogramMode,
    tickFormatOptions,
    layer,
    ticks,
  );
}

/** @internal */
export const getVisibleTickSetsSelector = createCustomCachedSelector(
  [
    getSettingsSpecSelector,
    getJoinedVisibleAxesData,
    computeSeriesDomainsSelector,
    computeSmallMultipleScalesSelector,
    countBarsInClusterSelector,
    isHistogramModeEnabledSelector,
    getFallBackTickFormatter,
    getBarPaddingsSelector,
  ],
  getVisibleTickSets,
);

const notTooDense = (domainFrom: number, domainTo: number, cartesianWidth: number) => (raster: TimeRaster<TimeBin>) => {
  const domainInSeconds = domainTo - domainFrom;
  const pixelsPerSecond = cartesianWidth / domainInSeconds;
  return pixelsPerSecond > raster.minimumPixelsPerSecond;
};

const getRasterSelector = (timeZone: string): ReturnType<typeof rasters> => {
  // these are hand tweaked constants that fulfill various design constraints, let's discuss before changing them
  const lineThicknessSteps = [/*0,*/ 0.5, 0.75, 1, 1, 1, 1.25, 1.25, 1.5, 1.5, 1.75, 1.75, 2, 2, 2, 2, 2];
  const lumaSteps = [/*255,*/ 192, 72, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];

  const darkMode = false;
  const smallFontSize = 12;

  const themeLight = {
    defaultFontColor: 'black',
    subduedFontColor: '#393939',
    offHourFontColor: 'black',
    weekendFontColor: 'darkred',
    backgroundColor: { r: 255, g: 255, b: 255 },
    lumaSteps,
  };

  const themeDark = {
    defaultFontColor: 'white',
    subduedFontColor: 'darkgrey',
    offHourFontColor: 'white',
    weekendFontColor: 'indianred',
    backgroundColor: { r: 0, g: 0, b: 0 },
    lumaSteps: lumaSteps.map((l) => 255 - l),
  };

  const config = {
    darkMode,
    sparse: false,
    implicit: false,
    maxLabelRowCount: TIME_AXIS_LAYER_COUNT, // can be 1, 2, 3
    a11y: {
      shortcuts: true,
      contrast: 'medium',
      animation: true,
      sonification: false,
    },
    locale: 'en-US',
    numUnit: 'short',
    ...(darkMode ? themeDark : themeLight),
    barChroma: { r: 96, g: 146, b: 192 },
    barFillAlpha: 0.3,
    lineThicknessSteps,
    minBinWidth: 'day',
    maxBinWidth: 'year',
    pixelRangeFrom: 100,
    pixelRangeTo: 500,
    tickLabelMaxProtrusionLeft: 0, // constraining not used yet
    tickLabelMaxProtrusionRight: 0, // constraining not used yet
    protrudeAxisLeft: true, // constraining not used yet
    protrudeAxisRight: true, // constraining not used yet
    smallFontSize,
    cssFontShorthand: `normal normal 100 ${smallFontSize}px "Atkinson Hyperlegible", Inter, Helvetica, sans-serif`,
    monospacedFontShorthand: `normal normal 100 ${smallFontSize}px "Roboto Mono", Consolas, Menlo, Courier, monospace`,
    rowPixelPitch: 16,
    horizontalPixelOffset: 4,
    verticalPixelOffset: 6,
    minimumTickPixelDistance: 24,
    workHourMin: 6,
    workHourMax: 21,
    clipLeft: true,
    clipRight: true,
  };

  return rasters(config, timeZone);
};

function getVisibleTickSets(
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  joinedAxesData: Map<AxisId, JoinedAxisData>,
  { xDomain, yDomains }: Pick<SeriesDomainsAndData, 'xDomain' | 'yDomains'>,
  smScales: SmallMultipleScales,
  totalGroupsCount: number,
  enableHistogramMode: boolean,
  fallBackTickFormatter: TickFormatter,
  barsPadding?: number,
): Projections {
  return withTextMeasure((textMeasure) => {
    const panel = getPanelSize(smScales);
    return [...joinedAxesData].reduce((acc, [axisId, { axisSpec, axesStyle, gridLine, tickFormatter }]) => {
      const { groupId, integersOnly, position, style } = axisSpec;
      const isX = isXDomain(position, chartRotation);
      const yDomain = yDomains.find((yd) => yd.groupId === groupId);
      const domain = isX ? xDomain : yDomain;
      const range = axisMinMax(axisSpec.position, chartRotation, panel);
      const maxTickCount = domain?.desiredTickCount ?? 0;

      const getMeasuredTicks = (
        scale: Scale<number | string>,
        ticks: (number | string)[],
        layer: number,
        options: Record<string, unknown>,
      ): Projection => {
        const ticks2: Array<string | number> = (options.timeTicks || scale.ticks()) as Array<string | number>;
        const tickFormatter2: JoinedAxisData['tickFormatter'] = (options.labelFormat ||
          tickFormatter) as JoinedAxisData['tickFormatter'];
        const labelBox = getLabelBox(axesStyle, ticks2, tickFormatter2, textMeasure, axisSpec, gridLine);
        return {
          ticks: getVisibleTickSet(
            scale,
            labelBox,
            { rotation: chartRotation },
            axisSpec,
            { xDomain },
            totalGroupsCount,
            enableHistogramMode,
            fallBackTickFormatter,
            layer,
            ticks,
            options,
          ),
          labelBox,
          scale, // tick count driving nicing; nicing drives domain; therefore scale may vary, downstream needs it
        };
      };

      const getScale = (desiredTickCount: number) =>
        isX
          ? computeXScale({
              xDomain: { ...xDomain, desiredTickCount },
              totalBarsInCluster: totalGroupsCount,
              range,
              barsPadding,
              enableHistogramMode,
              integersOnly,
            })
          : yDomain && new ScaleContinuous({ ...yDomain, range }, { ...yDomain, desiredTickCount, integersOnly });

      const fillLayerTimeslip = (layer: number, timeTicks: number[], labelFormat: (n: number) => string) => {
        const scale = getScale(100); // 10 is just a dummy value, the scale is only needed for its non-tick props like step, bandwidth, ...
        if (!scale) throw new Error('Scale generation for the multilayer axis failed');
        return {
          entry: getMeasuredTicks(scale, timeTicks, layer, { timeTicks, labelFormat }),
          fallbackAskedTickCount: NaN,
        };
      };

      const fillLayer = (layer: number, options: Record<string, unknown>, maxTickCountForLayer: number) => {
        let fallbackAskedTickCount = 2;
        let fallbackReceivedTickCount = Infinity;
        if (adaptiveTickCount) {
          let previousActualTickCount = NaN;
          for (let triedTickCount = maxTickCountForLayer; triedTickCount >= 2; triedTickCount--) {
            const scale = getScale(triedTickCount);
            if (!scale || scale.ticks().length === previousActualTickCount) continue;
            const raster = getMeasuredTicks(scale, scale.ticks(), layer, options);
            const nonZeroLengthTicks = raster.ticks.filter((tick) => tick.axisTickLabel.length > 0);
            const uniqueLabels = new Set(raster.ticks.map((tick) => tick.axisTickLabel));
            const noDuplicates = raster.ticks.length === uniqueLabels.size;
            const atLeastTwoTicks = uniqueLabels.size >= 2;
            const allTicksFit = !uniqueLabels.has('');
            const compliant =
              axisSpec &&
              (scale.type === ScaleType.Time || atLeastTwoTicks) &&
              (scale.type === ScaleType.Log || allTicksFit) &&
              (scale.type === ScaleType.Time ||
                (scale.type === ScaleType.Log
                  ? new Set(nonZeroLengthTicks.map((tick) => tick.axisTickLabel)).size === nonZeroLengthTicks.length
                  : noDuplicates));
            previousActualTickCount = scale.ticks().length;
            if (raster && compliant) {
              return {
                entry: {
                  ...raster,
                  ticks: scale.type === ScaleType.Log ? raster.ticks : nonZeroLengthTicks,
                },
                fallbackAskedTickCount,
              };
            } else if (atLeastTwoTicks && uniqueLabels.size <= fallbackReceivedTickCount) {
              // let's remember the smallest triedTickCount that yielded two distinct ticks
              fallbackReceivedTickCount = uniqueLabels.size;
              fallbackAskedTickCount = triedTickCount;
            }
          }
        }
        return { fallbackAskedTickCount };
      };

      const isMultilayerTimeAxis =
        domain?.type === ScaleType.Time && style?.tickLabel?.alignment?.horizontal === Position.Left;

      if (isMultilayerTimeAxis) {
        const rasterSelector = getRasterSelector(xDomain.timeZone);
        const domainFromS = Number((domain && domain.domain[0]) || NaN) / 1000;
        const domainToS = Number((domain && domain.domain[domain.domain.length - 1]) || NaN) / 1000;
        const layers = rasterSelector(notTooDense(domainFromS, domainToS, Math.abs(range[1] - range[0])));
        let layerIndex = 0;
        return acc.set(
          axisId,
          layers.reduce(
            (combinedEntry: { ticks: AxisTick[] }, l: TimeRaster<TimeBin>) => {
              if (layerIndex >= TIME_AXIS_LAYER_COUNT) return combinedEntry;
              // times 1000: convert seconds to milliseconds
              const { entry } = fillLayerTimeslip(
                layerIndex,
                [...l.binStarts(domainFromS, domainToS)]
                  .filter((b) => b.nextTimePointSec > domainFromS && b.timePointSec < domainToS)
                  .map((b) => 1000 * Math.max(domainFromS, b.timePointSec)),
                !l.labeled
                  ? () => ''
                  : layerIndex === TIME_AXIS_LAYER_COUNT - 1
                  ? l.detailedLabelFormat
                  : l.minorTickLabelFormat,
              );
              if (l.labeled) layerIndex++; // we want three (or however many) _labeled_ axis layers; others are useful for minor ticks/gridlines, and for giving coarser structure eg. stronger gridline for every 6th hour of the day
              const minLabelGap = 4;

              const lastTick = entry.ticks[entry.ticks.length - 1];
              if (lastTick.position + entry.labelBox.maxLabelBboxWidth > range[1]) lastTick.axisTickLabel = '';

              return {
                ...entry,
                ...combinedEntry,
                ticks: (combinedEntry.ticks || []).concat(
                  entry.ticks.filter(
                    (tick, i, a) =>
                      i > 0 || !a[1] || a[1].position - tick.position >= entry.labelBox.maxLabelBboxWidth + minLabelGap,
                  ),
                ),
              };
            },
            { ticks: [] }, // this should turn into a full Projection
          ),
        );
      }

      const { fallbackAskedTickCount, entry } = fillLayer(0, {}, maxTickCount);
      if (entry) return acc.set(axisId, entry);

      // todo dry it up
      const scale = getScale(adaptiveTickCount ? fallbackAskedTickCount : maxTickCount);
      const lastResortCandidate = scale && getMeasuredTicks(scale, scale.ticks(), 0, {});
      return lastResortCandidate ? acc.set(axisId, lastResortCandidate) : acc;
    }, new Map());
  });
}
