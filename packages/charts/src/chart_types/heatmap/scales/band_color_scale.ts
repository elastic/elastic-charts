/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPredicateFn } from '../../../common/predicate';
import { Color } from '../../../utils/common';
import { ColorBand, HeatmapBandsColorScale } from '../specs/heatmap';
import { ColorScale } from '../state/selectors/get_color_scale';

const TRANSPARENT_COLOR: Color = 'rgba(0, 0, 0, 0)';

function defaultColorBandFormatter(start: number, end: number) {
  const finiteStart = Number.isFinite(start);
  const finiteEnd = Number.isFinite(end);
  return !finiteStart && finiteEnd ? `< ${end}` : finiteStart && !finiteEnd ? `≥ ${start}` : `${start} - ${end}`;
}

/** @internal */
export function getBandsColorScale(
  colorScale: HeatmapBandsColorScale,
): { scale: ColorScale; bands: Required<ColorBand>[] } {
  const labelFormatter = colorScale.labelFormatter ?? defaultColorBandFormatter;
  const ascendingSortFn = getPredicateFn('numAsc', 'start');
  const bands = colorScale.bands
    .reduce<Required<ColorBand>[]>((acc, { start, end, color, label }) => {
      // admit only proper bands
      if (start < end) acc.push({ start, end, color, label: label ?? labelFormatter(start, end) });
      return acc;
    }, [])
    .sort(ascendingSortFn);

  const scale = getBandScale(bands);
  return { scale, bands };
}

function getBandScale(bands: ColorBand[]): ColorScale {
  return (value) => {
    for (let i = 0; i < bands.length; i++) {
      const { start, end, color } = bands[i];
      if (start <= value && value < end) {
        return color;
      }
    }
    return TRANSPARENT_COLOR;
  };
}
