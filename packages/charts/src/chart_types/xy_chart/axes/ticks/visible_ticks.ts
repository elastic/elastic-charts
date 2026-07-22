/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelLayout } from './labels';
import {
  createTickLabelLayout,
  MIN_LABEL_GAP,
  resolveTickLabelConstraints,
  shouldAllowWordWrap,
  withoutTickLabel,
} from './labels';
import type { AxisTick, GetMeasuredTicks, Projection, Projections, TextDirection } from './types';
import type { SmallMultipleScales } from '../../../../common/panel_utils';
import { getPanelSize } from '../../../../common/panel_utils';
import type { ScaleBand } from '../../../../scales';
import { ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { isContinuousScale } from '../../../../scales/types';
import type { AxisSpec, SettingsSpec } from '../../../../specs';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import type { Position, Rotation } from '../../../../utils/common';
import { isFiniteNumber, isRTLString } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import type { AxisId } from '../../../../utils/ids';
import type { Truncate } from '../../../../utils/themes/theme';
import type { AxisLabelFormatter } from '../../state/selectors/axis_tick_formatter';
import type { JoinedAxisData } from '../../state/selectors/compute_baseline_axes';
import type { ScaleConfigs } from '../../state/selectors/get_api_scale_configs';
import type { SeriesDomainsAndData } from '../../state/utils/types';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import { computeXScale } from '../../utils/scales';
import { multilayerAxisEntry } from '../timeslip/multilayer_ticks';

const USE_ADAPTIVE_TICK_COUNT = true;

function axisMinMax(axisPosition: Position, chartRotation: Rotation, { width, height }: Size): [number, number] {
  const horizontal = isHorizontalAxis(axisPosition);
  const flipped = horizontal
    ? chartRotation === -90 || chartRotation === 180
    : chartRotation === 90 || chartRotation === 180;
  return horizontal ? [flipped ? width : 0, flipped ? 0 : width] : [flipped ? 0 : height, flipped ? height : 0];
}

function getDirectionFn({ type }: ScaleBand | ScaleContinuous): (label: string) => TextDirection {
  return type === ScaleType.Ordinal
    ? (label) => (isRTLString(label) ? 'rtl' : 'ltr') // depends on label
    : () => 'ltr'; // always use ltr
}

/** @internal */
export function generateTicks(
  scale: ScaleBand | ScaleContinuous,
  ticks: (number | string)[],
  offset: number,
  layoutTickLabel: TickLabelLayout,
  formatTickLabel: AxisLabelFormatter,
  layer: number | undefined,
  detailedLayer: number,
  showGrid: boolean,
  multilayerTimeAxis: boolean,
): AxisTick[] {
  const getDirection = getDirectionFn(scale);
  const isContinuous = isContinuousScale(scale);
  return ticks.reduce<AxisTick[]>((acc, value, i) => {
    const label = formatTickLabel(value);
    if (typeof value === 'number' && !isFiniteNumber(value)) return acc;
    const domainClampedValue = isContinuous && typeof value === 'number' ? Math.max(value, scale.domain[0]) : value;
    if (typeof domainClampedValue === 'number' && !isFiniteNumber(domainClampedValue)) return acc;
    const position = scale.scale(value) + offset;
    const domainClampedPosition = scale.scale(domainClampedValue) + offset;

    if (!isFiniteNumber(position) || !isFiniteNumber(domainClampedPosition)) return acc;
    const layout = layoutTickLabel(label);
    if (layer === 0 && i === 0 && position < domainClampedPosition) return acc;

    acc.push({
      value,
      domainClampedValue,
      label,
      position,
      domainClampedPosition,
      layer,
      detailedLayer,
      showGrid,
      direction: getDirection(label),
      multilayerTimeAxis,
      layout,
    });
    return acc;
  }, []);
}

/** @internal */
export interface OverflowContext {
  position: Position;
  truncate: Truncate | false;
  labelBudget: number;
}

const OVERFLOW_EPSILON = 0.5;

/**
 * Cross-axis overflow: removes labels too big for the axis band (wider than the budget on a vertical axis, taller on a
 * horizontal one). Along-axis (container) overflow is handled separately by reserving the edge labels' overhang as margin
 * in `getAxesDimensions`, rather than by hiding those labels.
 * @internal
 */
export function hideCrossAxisOverflow(ticks: AxisTick[], overflow: OverflowContext): AxisTick[] {
  const { position, truncate, labelBudget } = overflow;

  if (truncate) return ticks;

  const vertical = isVerticalAxis(position);

  return ticks.map((tick) => {
    const crossSize = vertical ? tick.layout.bboxWidth : tick.layout.bboxHeight;
    return crossSize > labelBudget + OVERFLOW_EPSILON ? withoutTickLabel(tick) : tick;
  });
}

/** @internal */
export function getVisibleTicks(
  axisSpec: AxisSpec,
  layoutTickLabel: TickLabelLayout,
  formatTickLabel: AxisLabelFormatter,
  totalBarsInCluster: number,
  rotationOffset: number,
  scale: ScaleBand | ScaleContinuous,
  enableHistogramMode: boolean,
  layer: number | undefined,
  detailedLayer: number,
  ticks: (number | string)[],
  adaptiveTickCount: boolean,
  labelRotation: number,
  multilayerTimeAxis: boolean = false,
  showGrid = true,
): AxisTick[] {
  const isSingleValueScale = scale.domain[0] === scale.domain[1];
  const makeRaster = enableHistogramMode && scale.bandwidth > 0 && !multilayerTimeAxis;
  const ultimateTick = ticks.at(-1);
  const penultimateTick = ticks.at(-2);
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

  const firstTickValue = ticks[0];
  const allTicks: AxisTick[] =
    makeRaster && isSingleValueScale && typeof firstTickValue === 'number'
      ? (() => {
          const secondValue = firstTickValue + scale.minInterval;

          return [
            {
              value: firstTickValue,
              domainClampedValue: firstTickValue,
              label: formatTickLabel(firstTickValue),
              position: (scale.scale(firstTickValue) || 0) + offset,
              domainClampedPosition: (scale.scale(firstTickValue) || 0) + offset,
              layer: undefined, // no multiple layers with `singleValueScale`s
              detailedLayer: 0,
              direction: 'rtl',
              showGrid,
              multilayerTimeAxis,
              layout: layoutTickLabel(formatTickLabel(firstTickValue)),
            },
            {
              value: secondValue,
              domainClampedValue: secondValue,
              label: formatTickLabel(secondValue),
              position: scale.bandwidth + halfPadding * 2,
              domainClampedPosition: scale.bandwidth + halfPadding * 2,
              layer: undefined, // no multiple layers with `singleValueScale`s
              detailedLayer: 0,
              direction: 'rtl',
              showGrid,
              multilayerTimeAxis,
              layout: layoutTickLabel(formatTickLabel(secondValue)),
            },
          ];
        })()
      : generateTicks(
          scale,
          ticks,
          offset,
          layoutTickLabel,
          formatTickLabel,
          layer,
          detailedLayer,
          showGrid,
          multilayerTimeAxis,
        );

  const { showOverlappingTicks, showOverlappingLabels, position } = axisSpec;
  const bypassOverlapCheck = showOverlappingLabels || multilayerTimeAxis;
  if (bypassOverlapCheck) return allTicks;

  return allTicks
    .slice()
    .sort((a: AxisTick, b: AxisTick) => a.position - b.position)
    .reduce(
      (prev, tick) => {
        const requiredSpace = (isVerticalAxis(position) ? tick.layout.bboxHeight : tick.layout.bboxWidth) / 2;
        const tickLabelFits = tick.position >= prev.occupiedSpace + requiredSpace + MIN_LABEL_GAP;
        if (tickLabelFits || showOverlappingTicks) {
          prev.visibleTicks.push(tickLabelFits ? tick : withoutTickLabel(tick));
          if (tickLabelFits) prev.occupiedSpace = tick.position + requiredSpace;
        } else if (adaptiveTickCount && !tickLabelFits && !showOverlappingTicks) {
          prev.visibleTicks.push(withoutTickLabel(tick));
        }
        return prev;
      },
      { visibleTicks: [] as AxisTick[], occupiedSpace: -Infinity },
    ).visibleTicks;
}

function getVisibleTickSet(
  scale: ScaleBand | ScaleContinuous,
  layoutTickLabel: TickLabelLayout,
  formatTickLabel: AxisLabelFormatter,
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  axisSpec: AxisSpec,
  groupCount: number,
  histogramMode: boolean,
  layer: number | undefined,
  detailedLayer: number,
  ticks: (number | string)[],
  adaptiveTickCount: boolean,
  labelRotation: number,
  multilayerTimeAxis = false,
  showGrid = true,
): AxisTick[] {
  const vertical = isVerticalAxis(axisSpec.position);
  const somehowRotated = (vertical && chartRotation === -90) || (!vertical && chartRotation === 180);
  const rotationOffset = histogramMode && somehowRotated ? scale.step : 0; // todo find the true cause of the this offset issue

  return getVisibleTicks(
    axisSpec,
    layoutTickLabel,
    formatTickLabel,
    groupCount,
    rotationOffset,
    scale,
    histogramMode,
    layer,
    detailedLayer,
    ticks,
    adaptiveTickCount,
    labelRotation,
    multilayerTimeAxis,
    showGrid,
  );
}

/** @internal */
export function computeVisibleTickSets(
  textMeasure: TextMeasure,
  { rotation: chartRotation, locale, dow }: Pick<SettingsSpec, 'rotation' | 'locale' | 'dow'>,
  scaleConfigs: ScaleConfigs,
  joinedAxesData: Map<AxisId, JoinedAxisData>,
  { xDomain, yDomains }: Pick<SeriesDomainsAndData, 'xDomain' | 'yDomains'>,
  smScales: SmallMultipleScales,
  totalGroupsCount: number,
  enableHistogramMode: boolean,
  barsPadding?: number,
): Projections {
  const panel = getPanelSize(smScales);

  return [...joinedAxesData].reduce(
    (acc, [axisId, { axisSpec, axesStyle, isXAxis, labelFormatter: userProvidedLabelFormatter, layout }]) => {
      const { groupId, maximumFractionDigits, timeAxisLayerCount } = axisSpec;
      const yDomain = yDomains.find((yd) => yd.groupId === groupId);
      const domain = isXAxis ? xDomain : yDomain;
      const range = axisMinMax(axisSpec.position, chartRotation, panel);
      const maxTickCount = domain?.desiredTickCount ?? 0;
      const isNice = (isXAxis ? scaleConfigs.x.nice : scaleConfigs.y[groupId]?.nice) ?? false;
      const adaptiveTickCount = !isNice && USE_ADAPTIVE_TICK_COUNT;

      const getMeasuredTicks: GetMeasuredTicks = (
        scale: ScaleBand | ScaleContinuous,
        ticks: (number | string)[],
        layer: number | undefined,
        detailedLayer: number,
        labelFormatter: AxisLabelFormatter,
        showGrid = true,
      ): Projection => {
        const { maxLineLength, maxWrapLines } = resolveTickLabelConstraints({
          axisSpec,
          style: axesStyle,
          band: layout.band,
          scale,
          multilayerTimeAxis: layout.multilayerTimeAxis,
        });

        const layoutTickLabel = createTickLabelLayout(
          axesStyle,
          axisSpec,
          textMeasure,
          locale,
          maxWrapLines,
          maxLineLength,
          shouldAllowWordWrap(scale),
        );

        return {
          ticks: getVisibleTickSet(
            scale,
            layoutTickLabel,
            labelFormatter,
            { rotation: chartRotation },
            axisSpec,
            totalGroupsCount,
            enableHistogramMode,
            layer,
            detailedLayer,
            ticks,
            adaptiveTickCount,
            axesStyle.tickLabel.rotation,
            layout.multilayerTimeAxis,
            showGrid,
          ),
          scale, // tick count driving nicing; nicing drives domain; therefore scale may vary, downstream needs it
        };
      };

      const getScale = (desiredTickCount: number) =>
        isXAxis
          ? computeXScale({
              xDomain: { ...xDomain, desiredTickCount },
              totalBarsInCluster: totalGroupsCount,
              range,
              barsPadding,
              enableHistogramMode,
              maximumFractionDigits,
            })
          : yDomain &&
            new ScaleContinuous({ ...yDomain, range }, { ...yDomain, desiredTickCount, maximumFractionDigits });

      const fillLayer = (maxTickCountForLayer: number) => {
        let fallbackAskedTickCount = 2;
        let fallbackReceivedTickCount = Infinity;
        if (adaptiveTickCount) {
          let previousActualTickCount = NaN;
          for (let triedTickCount = maxTickCountForLayer; triedTickCount >= 1; triedTickCount--) {
            const scale = getScale(triedTickCount);
            const actualTickCount = scale?.ticks().length ?? 0;
            if (!scale || actualTickCount === previousActualTickCount || actualTickCount < 2) continue;
            const raster = getMeasuredTicks(scale, scale.ticks(), undefined, 0, userProvidedLabelFormatter);
            const nonZeroLengthTicks = raster.ticks.filter((tick) => tick.label.length > 0);
            const uniqueLabels = new Set(nonZeroLengthTicks.map((tick) => tick.label));
            const areLabelsUnique = nonZeroLengthTicks.length === uniqueLabels.size;
            const areAdjacentTimeLabelsUnique =
              scale.type === ScaleType.Time &&
              !axisSpec.showDuplicatedTicks &&
              (areLabelsUnique || nonZeroLengthTicks.every((d, i, a) => i === 0 || d.label !== a[i - 1]?.label));
            const atLeastTwoTicks = uniqueLabels.size >= 2;
            const allTicksFit = nonZeroLengthTicks.length === raster.ticks.length;
            const compliant =
              axisSpec &&
              (scale.type === ScaleType.Time || atLeastTwoTicks) &&
              (scale.type === ScaleType.Log || allTicksFit) &&
              ((scale.type === ScaleType.Time && (axisSpec.showDuplicatedTicks || areAdjacentTimeLabelsUnique)) ||
                (scale.type === ScaleType.Log
                  ? new Set(nonZeroLengthTicks.map((tick) => tick.label)).size === nonZeroLengthTicks.length
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

      if (layout.multilayerTimeAxis) {
        const scale = getScale(0); // the scale is only needed for its non-tick props like step, bandwidth, ...
        if (!scale || !isContinuousScale(scale)) throw new Error('Scale generation for the multilayer axis failed');
        return acc.set(
          axisId,
          multilayerAxisEntry(
            xDomain,
            isXAxis && xDomain.isBandScale && enableHistogramMode,
            range,
            timeAxisLayerCount,
            scale,
            getMeasuredTicks,
            locale,
            dow,
          ),
        );
      }

      const hideOverflowingLabels = (projection: Projection): Projection => ({
        ...projection,
        ticks: hideCrossAxisOverflow(projection.ticks, {
          position: axisSpec.position,
          truncate: axesStyle.tickLabel.truncate,
          labelBudget: layout.band.labelBudget,
        }),
      });

      const { fallbackAskedTickCount, entry } = fillLayer(maxTickCount);
      if (entry) return acc.set(axisId, hideOverflowingLabels(entry));

      // todo dry it up
      const scale = getScale(adaptiveTickCount ? fallbackAskedTickCount : maxTickCount);
      const lastResortCandidate =
        scale && getMeasuredTicks(scale, scale.ticks(), undefined, 0, userProvidedLabelFormatter);
      return lastResortCandidate ? acc.set(axisId, hideOverflowingLabels(lastResortCandidate)) : acc;
    },
    new Map(),
  );
}
