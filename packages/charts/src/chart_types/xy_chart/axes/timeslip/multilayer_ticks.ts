/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale, ScaleContinuous } from '../../../../scales';
import { XDomain } from '../../domains/types';
import { AxisLabelFormatter } from '../../state/selectors/axis_tick_formatter';
import { GetMeasuredTicks, Projection } from '../../state/selectors/visible_ticks';
import { rasters, TimeBin, TimeRaster } from './rasters';

const MAX_TIME_TICK_COUNT = 50; // this doesn't do much for narrow charts, but limits tick count to a maximum on wider ones
const WIDTH_FUDGE = 1.05; // raster bin widths are sometimes approximate, but there's no raster that's just 5% denser/sparser, so it's safe
const MAX_TIME_GRID_COUNT = 12;

/** @internal */
export const notTooDense = (
  domainFrom: number,
  domainTo: number,
  binWidth: number,
  cartesianWidth: number,
  maxTickCount = MAX_TIME_TICK_COUNT,
) => (raster: TimeRaster<TimeBin>) => {
  const domainInSeconds = domainTo - domainFrom;
  const pixelsPerSecond = cartesianWidth / domainInSeconds;
  return (
    pixelsPerSecond > raster.minimumPixelsPerSecond &&
    raster.approxWidthInMs * WIDTH_FUDGE >= binWidth &&
    (domainInSeconds * 1000) / maxTickCount <= raster.approxWidthInMs
  );
};

/** @internal */
export function multilayerAxisEntry(
  xDomain: XDomain,
  extendByOneBin: boolean,
  range: [number, number],
  timeAxisLayerCount: any,
  scale: Scale<string | number> | ScaleContinuous, // fixme it's only the latter for now
  getMeasuredTicks: GetMeasuredTicks,
): Projection {
  const rasterSelector = rasters({ minimumTickPixelDistance: 24, locale: 'en-US' }, xDomain.timeZone);
  const domainValues = xDomain.domain; // todo consider a property or object type rename
  const domainFromS = Number(domainValues[0]) / 1000; // todo rely on a type guard or check rather than conversion
  const binWidth = xDomain.minInterval;
  const domainExtension = extendByOneBin ? binWidth : 0;
  const domainToS = ((Number(domainValues[domainValues.length - 1]) || NaN) + domainExtension) / 1000;
  const layers = rasterSelector(notTooDense(domainFromS, domainToS, binWidth, Math.abs(range[1] - range[0])));
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
  return layers.reduce<Projection>(
    (combinedEntry, l, detailedLayerIndex) => {
      if (l.labeled) layerIndex++; // we want three (or however many) _labeled_ axis layers; others are useful for minor ticks/gridlines, and for giving coarser structure eg. stronger gridline for every 6th hour of the day
      if (layerIndex >= timeAxisLayerCount) return combinedEntry;
      const binWidthS = binWidth / 1000;
      const { entry } = fillLayerTimeslip(
        layerIndex,
        detailedLayerIndex,
        [...l.binStarts(domainFromS - binWidthS, domainToS + binWidthS)]
          .filter((b) => b.nextTimePointSec > domainFromS && b.timePointSec <= domainToS)
          .map((b) => 1000 * b.timePointSec),
        !l.labeled ? () => '' : layerIndex === timeAxisLayerCount - 1 ? l.detailedLabelFormat : l.minorTickLabelFormat,
        notTooDense(domainFromS, domainToS, binWidth, Math.abs(range[1] - range[0]), MAX_TIME_GRID_COUNT)(l),
      );
      const minLabelGap = 4;

      const lastTick = entry.ticks[entry.ticks.length - 1];
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
