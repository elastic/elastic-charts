/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale, ScaleContinuous } from '../../../../scales';
import { AxisSpec, SettingsSpec, TickFormatter, TickFormatterOptions } from '../../../../specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { Position, Rotation } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import {
  AxisTick,
  defaultTickFormatter,
  enableDuplicatedTicks,
  isXDomain,
  TickLabelBounds,
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
export type Tmp = { ticks: AxisTick[]; labelBox: TickLabelBounds };

const adaptiveTickCount = false;

function axisMinMax(axisPosition: Position, chartRotation: Rotation, { width, height }: Size): [number, number] {
  const horizontal = isHorizontalAxis(axisPosition);
  const flipped = horizontal
    ? chartRotation === -90 || chartRotation === 180
    : chartRotation === 90 || chartRotation === 180;
  return horizontal ? [flipped ? width : 0, flipped ? 0 : width] : [flipped ? 0 : height, flipped ? height : 0];
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

type TmpMap = Map<string, Tmp>;

function getVisibleTickSets(
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  joinedAxesData: Map<string, JoinedAxisData>,
  { xDomain, yDomains }: Pick<SeriesDomainsAndData, 'xDomain' | 'yDomains'>,
  smScales: SmallMultipleScales,
  totalGroupsCount: number,
  enableHistogramMode: boolean,
  fallBackTickFormatter: TickFormatter,
  barsPadding?: number,
): TmpMap {
  return withTextMeasure((textMeasure) => {
    const panel = getPanelSize(smScales);
    return [...joinedAxesData].reduce<TmpMap>((acc, [axisId, { axisSpec, axesStyle, gridLine, tickFormatter }]) => {
      const { groupId, integersOnly, position } = axisSpec;
      const isX = isXDomain(position, chartRotation);
      const yDomain = yDomains.find((yd) => yd.groupId === groupId);
      const maxTickCount = isX ? xDomain.desiredTickCount : yDomain?.desiredTickCount ?? 0;

      const tryWithTickCount = (desiredTickCount: number) => {
        const range = axisMinMax(axisSpec.position, chartRotation, panel);
        const scale = isX
          ? computeXScale({
              xDomain: { ...xDomain, desiredTickCount },
              totalBarsInCluster: totalGroupsCount,
              range,
              barsPadding,
              enableHistogramMode,
              integersOnly,
            })
          : yDomain && new ScaleContinuous({ ...yDomain, range }, { ...yDomain, desiredTickCount, integersOnly });
        if (!scale) return; // this doesn't happen, just humoring TS
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
          type: scale.type,
        };
      };
      if (adaptiveTickCount) {
        let previousActualTickCount = NaN;
        for (let triedTickCount = maxTickCount; triedTickCount >= 2; triedTickCount--) {
          const candidate = tryWithTickCount(triedTickCount);
          const ticks = candidate?.ticks ?? [];
          if (ticks.length === previousActualTickCount) continue;
          const uniqueLabels = new Set(ticks.map((tick) => tick.axisTickLabel));
          const noDuplicates = ticks.length === uniqueLabels.size;
          const atLeastTwoTicks = uniqueLabels.size >= 2;
          const allTicksFit = !uniqueLabels.has('');
          const compliant = axisSpec && (candidate?.type === 'time' || noDuplicates) && atLeastTwoTicks && allTicksFit;
          if (candidate && compliant) {
            return acc.set(axisId, { ...candidate, ticks: ticks.filter((t) => t.axisTickLabel.length) });
          }
          previousActualTickCount = ticks.length;
        }
      }

      const lastResortCandidate = tryWithTickCount(adaptiveTickCount ? 2 : maxTickCount);
      return lastResortCandidate ? acc.set(axisId, lastResortCandidate) : acc;
    }, new Map());
  });
}
