/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { unitIntervalWidth, AxisLayer, Interval, continuousTimeRasters } from './continuous_time_rasters';
import { ScaleContinuous } from '../../../../scales';
import { XDomain } from '../../domains/types';
import { AxisLabelFormatter } from '../../state/selectors/axis_tick_formatter';
import { GetMeasuredTicks, Projection } from '../../state/selectors/visible_ticks';

const WIDTH_FUDGE = 1.05; // raster bin widths are sometimes approximate, but there's no raster that's just 5% denser/sparser, so it's safe

/** @internal */
export const MAX_TIME_TICK_COUNT = 50; // this doesn't do much for narrow charts, but limits tick count to a maximum on wider ones

/** @internal */
export const MAX_TIME_GRID_COUNT = 12;

/** @internal */
export const DEFAULT_LOCALE = 'en-US';

/** @internal */
export const MINIMUM_TICK_PIXEL_DISTANCE = 24;

/** @internal */
export const notTooDense =
  (domainFrom: number, domainTo: number, intervalWidth: number, cartesianWidth: number, maxTickCount: number) =>
  ({
    unit,
    unitMultiplier,
    minimumTickPixelDistance,
  }: Pick<AxisLayer<Interval>, 'unit' | 'unitMultiplier' | 'minimumTickPixelDistance'>) => {
    const domainSize = domainTo - domainFrom;
    const partitionIntervalWidth = unitIntervalWidth[unit] * unitMultiplier;
    const maximumTickCount = Math.min(maxTickCount, cartesianWidth / minimumTickPixelDistance);
    const tickCountConstraint = domainSize / maximumTickCount;
    const spacingConstraint = intervalWidth / WIDTH_FUDGE;
    return partitionIntervalWidth >= Math.max(tickCountConstraint, spacingConstraint); // heed both constraints
  };

/** @internal */
export function multilayerAxisEntry(
  xDomain: XDomain,
  extendByOneBin: boolean,
  range: [number, number],
  timeAxisLayerCount: number,
  scale: ScaleContinuous,
  getMeasuredTicks: GetMeasuredTicks,
): Projection {
  const rasterSelector = continuousTimeRasters(
    { minimumTickPixelDistance: MINIMUM_TICK_PIXEL_DISTANCE, locale: DEFAULT_LOCALE },
    xDomain.timeZone,
  );
  const domainValues = xDomain.domain; // todo consider a property or object type rename
  const domainFromS = Number(domainValues[0]) / 1000; // todo rely on a type guard or check rather than conversion
  const binWidthMs = xDomain.minInterval;
  const binWidth = binWidthMs / 1000; // seconds to milliseconds
  const domainExtension = extendByOneBin ? binWidthMs : 0;
  const domainToS = ((Number(domainValues.at(-1)) || NaN) + domainExtension) / 1000;
  const cartesianWidth = Math.abs(range[1] - range[0]);
  const layers = rasterSelector(notTooDense(domainFromS, domainToS, binWidth, cartesianWidth, MAX_TIME_TICK_COUNT));
  let layerIndex = -1;
  const fillLayerTimeslip = (
    layer: number,
    detailedLayer: number,
    timeTicks: number[],
    labelFormat: AxisLabelFormatter<number>,
    showGrid: boolean,
  ) => {
    return {
      entry: getMeasuredTicks(scale, timeTicks, layer, detailedLayer, labelFormat as AxisLabelFormatter, showGrid),
      fallbackAskedTickCount: NaN,
    };
  };

  const binStartsFrom = domainFromS - binWidth;
  const binStartsTo = domainToS + binWidth;

  return layers.reduce<Projection>(
    (combinedEntry, l, detailedLayerIndex) => {
      if (l.labeled) layerIndex++; // we want three (or however many) _labeled_ axis layers; others are useful for minor ticks/gridlines, and for giving coarser structure eg. stronger gridline for every 6th hour of the day
      if (layerIndex >= timeAxisLayerCount) return combinedEntry;
      const timeTicks = [...l.intervals(binStartsFrom, binStartsTo)]
        .filter((b) => b.supremum > domainFromS && b.minimum <= domainToS)
        .map((b) => 1000 * b.minimum);
      const { entry } = fillLayerTimeslip(
        layerIndex,
        detailedLayerIndex,
        timeTicks,
        !l.labeled ? () => '' : layerIndex === timeAxisLayerCount - 1 ? l.detailedLabelFormat : l.minorTickLabelFormat,
        notTooDense(domainFromS, domainToS, binWidth, cartesianWidth, MAX_TIME_GRID_COUNT)(l),
      );
      const minLabelGap = 4;

      const lastTick = entry.ticks.at(-1);
      if (lastTick && lastTick.position + entry.labelBox.maxLabelBboxWidth > range[1]) {
        lastTick.label = '';
      }

      return {
        ...combinedEntry,
        ...entry,
        ticks: (combinedEntry.ticks || []).concat(
          entry.ticks.filter(
            (tick, i, a) =>
              i > 0 ||
              !a[1] ||
              a[1].domainClampedPosition - tick.domainClampedPosition >= entry.labelBox.maxLabelBboxWidth + minLabelGap,
          ),
        ),
      };
    },
    {
      ticks: [],
      labelBox: {
        maxLabelBboxWidth: 0,
        maxLabelBboxHeight: 0,
        maxLabelTextWidth: 0,
        maxLabelTextHeight: 0,
        isHidden: true,
      },
      scale,
    },
  );
}
