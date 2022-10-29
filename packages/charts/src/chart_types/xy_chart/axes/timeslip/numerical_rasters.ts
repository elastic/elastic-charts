/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/unbound-method */

import { getDecimalTicks, oneFive } from '../../../timeslip/projections/axis_model';
import { AxisLayer, Interval, RasterConfig } from './continuous_time_rasters';

const numericalLayerCount = 2;

/** @internal */
export const numericalRasters = ({ minimumTickPixelDistance, locale }: RasterConfig) => {
  const numberFormat = new Intl.NumberFormat(locale, {
    notation: 'standard',
    maximumFractionDigits: 0,
  });
  const formatter = numberFormat.format.bind(numberFormat);
  const allRasters: AxisLayer<Interval>[] = [...new Array(numericalLayerCount)]
    .map(
      (_, i): AxisLayer<Interval> => ({
        unit: 'one',
        unitMultiplier: Infinity,
        labeled: i === 0,
        minimumTickPixelDistance,
        intervals: (domainFrom, domainTo) =>
          getDecimalTicks(domainFrom, domainTo, i === 0 ? 20 : 5, oneFive).map((d, i, a) => ({
            minimum: d,
            supremum: i < a.length - 1 ? a[i + 1] : d + (d - a[i - 1]),
          })),
        detailedLabelFormat: (n: number) => formatter((n - 1300000000000) / 1e6),
        minorTickLabelFormat: (n: number) => formatter((n - 1300000000000) / 1e6),
      }),
    )
    .reverse();

  return (filter: (layer: AxisLayer<Interval>) => boolean) => {
    // keep increasingly finer granularities, but only until there's enough pixel width for them to fit
    const layers: Set<AxisLayer<Interval>> = new Set();
    for (const layer of allRasters) {
      if (filter(layer)) layers.add(layer);
      else break; // `rasters` is ordered, so we exit the loop here, it's already too dense, remaining ones are ignored
    }

    return [...layers].reverse(); // while we iterated from coarse to dense, the result follows the axis layer order: finer toward coarser
  };
};
