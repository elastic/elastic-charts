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
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const allTicks: AxisTick[] = scale.ticks().map((tick) => ({
    value: tick,
    label: (axisSpec.tickFormat ?? fallBackTickFormatter)(tick, tickFormatOptions),
    axisTickLabel: (axisSpec.labelFormat ?? axisSpec.tickFormat ?? fallBackTickFormatter)(tick, tickFormatOptions),
    position: (scale.scale(tick) || 0) + offset,
  }));
  return axisSpec.showDuplicatedTicks
    ? allTicks
    : allTicks.filter((d, i) => i < 1 || allTicks[i - 1].axisTickLabel !== d.axisTickLabel);
}

function getVisibleTicks(
  axisSpec: AxisSpec,
  labelBox: TickLabelBounds,
  totalBarsInCluster: number,
  fallBackTickFormatter: TickFormatter,
  rotationOffset: number,
  scale: Scale<number | string>,
  enableHistogramMode: boolean,
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const ticks = scale.ticks();
  const isSingleValueScale = scale.domain[0] === scale.domain[1];
  const makeRaster = enableHistogramMode && scale.bandwidth > 0;
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
  const labelFormatter = axisSpec.labelFormat ?? tickFormatter;
  const firstTickValue = ticks[0];
  const allTicks: AxisTick[] =
    makeRaster && isSingleValueScale && typeof firstTickValue === 'number'
      ? [
          {
            value: firstTickValue,
            label: tickFormatter(firstTickValue, tickFormatOptions),
            axisTickLabel: labelFormatter(firstTickValue, tickFormatOptions),
            position: (scale.scale(firstTickValue) || 0) + offset,
          },
          {
            value: firstTickValue + scale.minInterval,
            label: tickFormatter(firstTickValue + scale.minInterval, tickFormatOptions),
            axisTickLabel: labelFormatter(firstTickValue + scale.minInterval, tickFormatOptions),
            position: scale.bandwidth + halfPadding * 2,
          },
        ]
      : enableDuplicatedTicks(axisSpec, scale, offset, fallBackTickFormatter, tickFormatOptions);

  const { showOverlappingTicks, showOverlappingLabels, position } = axisSpec;
  const requiredSpace = isVerticalAxis(position) ? labelBox.maxLabelBboxHeight / 2 : labelBox.maxLabelBboxWidth / 2;
  return showOverlappingLabels
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
) {
  const vertical = isVerticalAxis(axisSpec.position);
  const tickFormatter = vertical ? fallBackTickFormatter : defaultTickFormatter;
  const somehowRotated = (vertical && chartRotation === -90) || (!vertical && chartRotation === 180);
  const rotationOffset = histogramMode && somehowRotated ? scale.step : 0; // todo find the true cause of the this offset issue
  const options = { timeZone };
  return getVisibleTicks(axisSpec, labelBox, groupCount, tickFormatter, rotationOffset, scale, histogramMode, options);
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
      const { groupId, integersOnly, position } = axisSpec;
      const isX = isXDomain(position, chartRotation);
      const yDomain = yDomains.find((yd) => yd.groupId === groupId);
      const maxTickCount = isX ? xDomain.desiredTickCount : yDomain?.desiredTickCount ?? 0;

      const getScale = (desiredTickCount: number) => {
        const range = axisMinMax(axisSpec.position, chartRotation, panel);
        return isX
          ? computeXScale({
              xDomain: { ...xDomain, desiredTickCount },
              totalBarsInCluster: totalGroupsCount,
              range,
              barsPadding,
              enableHistogramMode,
              integersOnly,
            })
          : yDomain && new ScaleContinuous({ ...yDomain, range }, { ...yDomain, desiredTickCount, integersOnly });
      };

      const getMeasuredTicks = (scale: Scale<number | string>) => {
        const labelBox = getLabelBox(axesStyle, scale, tickFormatter, textMeasure, axisSpec, gridLine);
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
          ),
          labelBox,
          scale, // tick count driving nicing; nicing drives domain; therefore scale may vary, downstream needs it
        };
      };

      let fallbackAskedTickCount = 2;
      let fallbackReceivedTickCount = Infinity;
      if (adaptiveTickCount) {
        let previousActualTickCount = NaN;
        for (let triedTickCount = maxTickCount; triedTickCount >= 2; triedTickCount--) {
          const scale = getScale(triedTickCount);
          if (!scale || scale.ticks().length === previousActualTickCount) continue;
          const candidate = getMeasuredTicks(scale);
          const nonZeroLengthTicks = candidate.ticks.filter((tick) => tick.axisTickLabel.length > 0);
          const uniqueLabels = new Set(candidate.ticks.map((tick) => tick.axisTickLabel));
          const noDuplicates = candidate.ticks.length === uniqueLabels.size;
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
          if (candidate && compliant) {
            // we're done!
            return acc.set(axisId, {
              ...candidate,
              ticks: scale.type === ScaleType.Log ? candidate.ticks : nonZeroLengthTicks,
            });
          } else if (atLeastTwoTicks && uniqueLabels.size <= fallbackReceivedTickCount) {
            // let's remember the smallest triedTickCount that yielded two distinct ticks
            fallbackReceivedTickCount = uniqueLabels.size;
            fallbackAskedTickCount = triedTickCount;
          }
        }
      }

      const scale = getScale(adaptiveTickCount ? fallbackAskedTickCount : maxTickCount);
      const lastResortCandidate = scale && getMeasuredTicks(scale);
      return lastResortCandidate ? acc.set(axisId, lastResortCandidate) : acc;
    }, new Map());
  });
}
