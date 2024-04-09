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
import { PointerValue } from '../../../state/types';
import { getAccessorFormatLabel } from '../../../utils/accessor';
import { isDefined } from '../../../utils/common';
import { BandedAccessorType, IndexedGeometry } from '../../../utils/geometry';
import { defaultTickFormatter } from '../utils/axis_utils';
import { getSeriesName } from '../utils/series';
import { AxisSpec, BasicSeriesSpec, isAreaSeriesSpec, isBarSeriesSpec, TickFormatterOptions } from '../utils/specs';

/** @internal */
export const Y0_ACCESSOR_POSTFIX = ' - lower';
/** @internal */
export const Y1_ACCESSOR_POSTFIX = ' - upper';

/** @internal */
export function getLegendItemExtraValues(tooltipValues: TooltipValue[]): Map<SeriesKey, LegendItemExtraValues> {
  const seriesTooltipValues = new Map<SeriesKey, LegendItemExtraValues>();

  tooltipValues.forEach(({ formattedValue, value, seriesIdentifier, valueAccessor }) => {
    const current: LegendItemExtraValues = seriesTooltipValues.get(seriesIdentifier.key) ?? new Map();
    if (valueAccessor === BandedAccessorType.Y0 || valueAccessor === BandedAccessorType.Y1) {
      current.set(valueAccessor, { label: formattedValue, value });
    }
    seriesTooltipValues.set(seriesIdentifier.key, current);
  });
  return seriesTooltipValues;
}

/** @internal */
export function formatTooltipValue(
  { color, value: { y, mark, accessor, datum }, seriesIdentifier }: IndexedGeometry,
  spec: BasicSeriesSpec,
  isHighlighted: boolean,
  hasSingleSeries: boolean,
  isBanded: boolean,
  axisSpec?: AxisSpec,
): TooltipValue {
  let label = getSeriesName(seriesIdentifier, hasSingleSeries, true, spec);

  if (isBanded && (isAreaSeriesSpec(spec) || isBarSeriesSpec(spec))) {
    const { y0AccessorFormat = Y0_ACCESSOR_POSTFIX, y1AccessorFormat = Y1_ACCESSOR_POSTFIX } = spec;
    const formatter = accessor === BandedAccessorType.Y0 ? y0AccessorFormat : y1AccessorFormat;
    label = getAccessorFormatLabel(formatter, label);
  }
  const isVisible = label.length > 0 && (!spec.filterSeriesInTooltip || spec.filterSeriesInTooltip(seriesIdentifier));
  const markValue = mark === null || Number.isNaN(mark) ? null : mark;
  const tickFormatOptions: TickFormatterOptions | undefined = spec.timeZone ? { timeZone: spec.timeZone } : undefined;
  const tickFormatter = spec.tickFormat ?? axisSpec?.tickFormat ?? defaultTickFormatter;

  return {
    seriesIdentifier,
    valueAccessor: accessor,
    label,
    value: y,
    formattedValue: tickFormatter(y, tickFormatOptions),
    markValue,
    ...(isDefined(markValue) && {
      formattedMarkValue: spec.markFormat
        ? spec.markFormat(markValue, tickFormatOptions)
        : defaultTickFormatter(markValue),
    }),
    color,
    isHighlighted,
    isVisible,
    datum,
  };
}

/** @internal */
export function formatTooltipHeader(
  { value: { x } }: IndexedGeometry,
  spec: BasicSeriesSpec,
  axisSpec?: AxisSpec,
): PointerValue {
  const tickFormatOptions: TickFormatterOptions | undefined = spec.timeZone ? { timeZone: spec.timeZone } : undefined;
  const tickFormatter = axisSpec?.tickFormat ?? defaultTickFormatter;

  return {
    value: x,
    formattedValue: tickFormatter(x, tickFormatOptions),
  };
}
