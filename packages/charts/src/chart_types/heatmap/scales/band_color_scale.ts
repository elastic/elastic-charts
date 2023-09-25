/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Colors } from '../../../common/colors';
import { getPredicateFn } from '../../../common/predicate';
import { isFiniteNumber, safeFormat, ValueFormatter } from '../../../utils/common';
import { ColorBand, HeatmapBandsColorScale } from '../specs/heatmap';
import { ColorScale } from '../state/selectors/get_color_scale';

function defaultColorBandFormatter(valueFormatter?: ValueFormatter) {
  return (startValue: number, endValue: number) => {
    const finiteStart = Number.isFinite(startValue);
    const finiteEnd = Number.isFinite(endValue);
    const start = safeFormat(startValue, valueFormatter);
    const end = safeFormat(endValue, valueFormatter);
    return !finiteStart && finiteEnd ? `< ${end}` : finiteStart && !finiteEnd ? `≥ ${start}` : `${start} - ${end}`;
  };
}

/** @internal */
export function getBandsColorScale(
  colorScale: HeatmapBandsColorScale,
  locale: string,
  valueFormatter?: ValueFormatter,
): { scale: ColorScale; bands: Required<ColorBand>[] } {
  const labelFormatter = colorScale.labelFormatter ?? defaultColorBandFormatter(valueFormatter);
  const ascendingSortFn = getPredicateFn('numAsc', locale, 'start');
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
    // this prevents assigning a color to NaN values
    if (!isFiniteNumber(value)) {
      return Colors.Transparent.keyword;
    }

    return bands.find(({ start, end }) => start <= value && value < end)?.color ?? Colors.Transparent.keyword;
  };
}
