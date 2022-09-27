/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItemExtraValues } from '../../../common/legend';
import { SeriesKey } from '../../../common/series_id';
import { TooltipValue } from '../../../specs';
import { getAccessorFormatLabel } from '../../../utils/accessor';
import { isDefined } from '../../../utils/common';
import { BandedAccessorType, IndexedGeometry } from '../../../utils/geometry';
import { defaultTickFormatter } from '../utils/axis_utils';
import { getSeriesName, isBandedSpec } from '../utils/series';
import { AxisSpec, BasicSeriesSpec, isAreaSeriesSpec, isBarSeriesSpec, TickFormatterOptions } from '../utils/specs';

/** @internal */
export const Y0_ACCESSOR_POSTFIX = ' - lower';
/** @internal */
export const Y1_ACCESSOR_POSTFIX = ' - upper';

/** @internal */
export function getLegendItemExtraValues(
  tooltipValues: TooltipValue[],
  defaultValue?: string,
): Map<SeriesKey, LegendItemExtraValues> {
  const seriesTooltipValues = new Map<SeriesKey, LegendItemExtraValues>();

  tooltipValues.forEach(({ formattedValue, seriesIdentifier, valueAccessor }) => {
    const seriesValue = defaultValue || formattedValue;
    const current: LegendItemExtraValues = seriesTooltipValues.get(seriesIdentifier.key) ?? new Map();
    if (defaultValue) {
      if (!current.has(BandedAccessorType.Y0)) {
        current.set(BandedAccessorType.Y0, defaultValue);
      }
      if (!current.has(BandedAccessorType.Y1)) {
        current.set(BandedAccessorType.Y1, defaultValue);
      }
    }

    if (valueAccessor === BandedAccessorType.Y0 || valueAccessor === BandedAccessorType.Y1) {
      current.set(valueAccessor, seriesValue);
    }
    seriesTooltipValues.set(seriesIdentifier.key, current);
  });
  return seriesTooltipValues;
}

/** @internal */
export function formatTooltip(
  { color, value: { x, y, mark, accessor, datum }, seriesIdentifier }: IndexedGeometry,
  spec: BasicSeriesSpec,
  isHeader: boolean,
  isHighlighted: boolean,
  hasSingleSeries: boolean,
  axisSpec?: AxisSpec,
): TooltipValue {
  let label = getSeriesName(seriesIdentifier, hasSingleSeries, true, spec);

  if (isBandedSpec(spec) && (isAreaSeriesSpec(spec) || isBarSeriesSpec(spec))) {
    const { y0AccessorFormat = Y0_ACCESSOR_POSTFIX, y1AccessorFormat = Y1_ACCESSOR_POSTFIX } = spec;
    const formatter = accessor === BandedAccessorType.Y0 ? y0AccessorFormat : y1AccessorFormat;
    label = getAccessorFormatLabel(formatter, label);
  }
  const isVisible = label.length > 0 && (!spec.filterSeriesInTooltip || spec.filterSeriesInTooltip(seriesIdentifier));
  const value = isHeader ? x : y;
  const markValue = isHeader || mark === null || Number.isNaN(mark) ? null : mark;
  const tickFormatOptions: TickFormatterOptions | undefined = spec.timeZone ? { timeZone: spec.timeZone } : undefined;
  const tickFormatter =
    (isHeader ? axisSpec?.tickFormat : spec.tickFormat ?? axisSpec?.tickFormat) ?? defaultTickFormatter;

  return {
    seriesIdentifier,
    valueAccessor: accessor,
    label,
    value,
    formattedValue: tickFormatter(value, tickFormatOptions),
    markValue,
    ...(isDefined(markValue) && {
      formattedMarkValue: spec.markFormat
        ? spec.markFormat(markValue, tickFormatOptions)
        : defaultTickFormatter(markValue),
    }),
    color,
    isHighlighted: isHighlighted && !isHeader,
    isVisible,
    datum,
  };
}
