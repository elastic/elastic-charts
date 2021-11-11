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
import { multilayerAxisEntry } from '../../axes/timeslip/multilayer_ticks';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import { AxisTick, defaultTickFormatter, isXDomain, TickLabelBounds } from '../../utils/axis_utils';
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
type LabelFormatter = (d: number | string, ...otherArgs: unknown[]) => string;
type AxisTickFormatOptions = TickFormatterOptions & {
  labelFormat?: LabelFormatter;
};

const adaptiveTickCount = true;

function axisMinMax(axisPosition: Position, chartRotation: Rotation, { width, height }: Size): [number, number] {
  const horizontal = isHorizontalAxis(axisPosition);
  const flipped = horizontal
    ? chartRotation === -90 || chartRotation === 180
    : chartRotation === 90 || chartRotation === 180;
  return horizontal ? [flipped ? width : 0, flipped ? 0 : width] : [flipped ? 0 : height, flipped ? height : 0];
}

/** @internal */
export function generateTicks(
  axisSpec: AxisSpec,
  scale: Scale<number | string>,
  ticks: (number | string)[],
  offset: number,
  tickFormatOptions: AxisTickFormatOptions,
  tickFormatter: TickFormatter,
  labelFormatter: LabelFormatter | TickFormatter,
  layer: number | undefined,
  detailedLayer: number,
  showGrid: boolean,
): AxisTick[] {
  return ticks.map((value) => {
    const domainClampedValue =
      typeof value === 'number' && typeof scale.domain[0] === 'number' ? Math.max(scale.domain[0], value) : value;
    return {
      value,
      domainClampedValue,
      label: tickFormatter(value, tickFormatOptions),
      axisTickLabel: labelFormatter(value, tickFormatOptions),
      position: (scale.scale(value) || 0) + offset, // todo it doesn't look desirable to convert a NaN into a zero
      domainClampedPosition: (scale.scale(domainClampedValue) || 0) + offset, // todo it doesn't look desirable to convert a NaN into a zero
      layer,
      detailedLayer,
      showGrid,
    };
  });
}

function getVisibleTicks(
  axisSpec: AxisSpec,
  labelBox: TickLabelBounds,
  totalBarsInCluster: number,
  fallBackTickFormatter: TickFormatter,
  rotationOffset: number,
  scale: Scale<number | string>,
  enableHistogramMode: boolean,
  tickFormatOptions: AxisTickFormatOptions,
  layer: number | undefined,
  detailedLayer: number,
  ticks: (number | string)[],
  isMultilayerTimeAxis: boolean = false,
  showGrid = true,
): AxisTick[] {
  const isSingleValueScale = scale.domain[0] === scale.domain[1];
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
  const labelFormatter = tickFormatOptions.labelFormat ?? axisSpec.labelFormat ?? tickFormatter;
  const firstTickValue = ticks[0];
  const allTicks: AxisTick[] =
    makeRaster && isSingleValueScale && typeof firstTickValue === 'number'
      ? [
          {
            value: firstTickValue,
            domainClampedValue: firstTickValue,
            label: tickFormatter(firstTickValue, tickFormatOptions),
            axisTickLabel: labelFormatter(firstTickValue, tickFormatOptions),
            position: (scale.scale(firstTickValue) || 0) + offset,
            domainClampedPosition: (scale.scale(firstTickValue) || 0) + offset,
            layer: undefined, // no multiple layers with `singleValueScale`s
            detailedLayer: 0,
            showGrid,
          },
          {
            value: firstTickValue + scale.minInterval,
            domainClampedValue: firstTickValue + scale.minInterval,
            label: tickFormatter(firstTickValue + scale.minInterval, tickFormatOptions),
            axisTickLabel: labelFormatter(firstTickValue + scale.minInterval, tickFormatOptions),
            position: scale.bandwidth + halfPadding * 2,
            domainClampedPosition: scale.bandwidth + halfPadding * 2,
            layer: undefined, // no multiple layers with `singleValueScale`s
            detailedLayer: 0,
            showGrid,
          },
        ]
      : generateTicks(
          axisSpec,
          scale,
          ticks,
          offset,
          tickFormatOptions,
          tickFormatter,
          labelFormatter,
          layer,
          detailedLayer,
          showGrid,
        );

  const { showOverlappingTicks, showOverlappingLabels, position } = axisSpec;
  const requiredSpace = isVerticalAxis(position) ? labelBox.maxLabelBboxHeight / 2 : labelBox.maxLabelBboxWidth / 2;
  const bypassOverlapCheck = showOverlappingLabels || isMultilayerTimeAxis;
  return bypassOverlapCheck
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
  layer: number | undefined,
  detailedLayer: number,
  ticks: (number | string)[],
  labelFormat?: (d: number | string) => string,
  isMultilayerTimeAxis = false,
  showGrid = true,
): AxisTick[] {
  const vertical = isVerticalAxis(axisSpec.position);
  const tickFormatter = vertical ? fallBackTickFormatter : defaultTickFormatter;
  const somehowRotated = (vertical && chartRotation === -90) || (!vertical && chartRotation === 180);
  const rotationOffset = histogramMode && somehowRotated ? scale.step : 0; // todo find the true cause of the this offset issue
  const tickFormatOptions = labelFormat ? { labelFormat, timeZone } : { timeZone };
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
    detailedLayer,
    ticks,
    isMultilayerTimeAxis,
    showGrid,
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
      const { groupId, integersOnly, position, timeAxisLayerCount } = axisSpec;
      const isX = isXDomain(position, chartRotation);
      const yDomain = yDomains.find((yd) => yd.groupId === groupId);
      const domain = isX ? xDomain : yDomain;
      const range = axisMinMax(axisSpec.position, chartRotation, panel);
      const maxTickCount = domain?.desiredTickCount ?? 0;
      const isMultilayerTimeAxis = domain?.type === ScaleType.Time && timeAxisLayerCount > 0;

      const getMeasuredTicks = (
        scale: Scale<number | string>,
        ticks: (number | string)[],
        layer: number | undefined,
        detailedLayer: number,
        labelFormat?: (d: number | string) => string,
        showGrid = true,
      ): Projection => {
        const labelBox = getLabelBox(axesStyle, ticks, labelFormat || tickFormatter, textMeasure, axisSpec, gridLine);
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
            detailedLayer,
            ticks,
            labelFormat,
            isMultilayerTimeAxis,
            showGrid,
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

      const fillLayer = (maxTickCountForLayer: number) => {
        let fallbackAskedTickCount = 2;
        let fallbackReceivedTickCount = Infinity;
        if (adaptiveTickCount) {
          let previousActualTickCount = NaN;
          for (let triedTickCount = maxTickCountForLayer; triedTickCount >= 1; triedTickCount--) {
            const scale = getScale(triedTickCount);
            const actualTickCount = scale?.ticks().length ?? 0;
            if (!scale || actualTickCount === previousActualTickCount || actualTickCount < 2) continue;
            const raster = getMeasuredTicks(scale, scale.ticks(), undefined, 0);
            const nonZeroLengthTicks = raster.ticks.filter((tick) => tick.axisTickLabel.length > 0);
            const uniqueLabels = new Set(raster.ticks.map((tick) => tick.axisTickLabel));
            const areLabelsUnique = raster.ticks.length === uniqueLabels.size;
            const areAdjacentTimeLabelsUnique =
              scale.type === ScaleType.Time &&
              !axisSpec.showDuplicatedTicks &&
              (areLabelsUnique ||
                raster.ticks.every((d, i, a) => i === 0 || d.axisTickLabel !== a[i - 1].axisTickLabel));
            const atLeastTwoTicks = uniqueLabels.size >= 2;
            const allTicksFit = !uniqueLabels.has('');
            const compliant =
              axisSpec &&
              (scale.type === ScaleType.Time || atLeastTwoTicks) &&
              (scale.type === ScaleType.Log || allTicksFit) &&
              ((scale.type === ScaleType.Time && (axisSpec.showDuplicatedTicks || areAdjacentTimeLabelsUnique)) ||
                (scale.type === ScaleType.Log
                  ? new Set(nonZeroLengthTicks.map((tick) => tick.axisTickLabel)).size === nonZeroLengthTicks.length
                  : areLabelsUnique));
            previousActualTickCount = actualTickCount;
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

      if (isMultilayerTimeAxis) {
        const scale = getScale(0); // the scale is only needed for its non-tick props like step, bandwidth, ...
        if (!scale) throw new Error('Scale generation for the multilayer axis failed');
        return acc.set(
          axisId,
          multilayerAxisEntry(
            xDomain,
            isX && xDomain.isBandScale && enableHistogramMode,
            range,
            timeAxisLayerCount,
            scale,
            getMeasuredTicks,
          ),
        );
      }

      const { fallbackAskedTickCount, entry } = fillLayer(maxTickCount);
      if (entry) return acc.set(axisId, entry);

      // todo dry it up
      const scale = getScale(adaptiveTickCount ? fallbackAskedTickCount : maxTickCount);
      const lastResortCandidate = scale && getMeasuredTicks(scale, scale.ticks(), undefined, 0);
      return lastResortCandidate ? acc.set(axisId, lastResortCandidate) : acc;
    }, new Map());
  });
}
