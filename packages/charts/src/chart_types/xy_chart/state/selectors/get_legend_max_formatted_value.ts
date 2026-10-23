/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeFullSeriesDomainsSelector, computeSeriesDomainsSelector } from './compute_series_domains';
import { getAxisSpecsSelector } from './get_specs';
import { DEFAULT_FONT_FAMILY } from '../../../../common/default_theme_attributes';
import { LegendValue, shouldDisplayGridList } from '../../../../common/legend';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { getDatumYValue } from '../../rendering/points';
import { defaultTickFormatter } from '../../utils/axis_utils';
import { isBandedSpec } from '../../utils/series';
import type { TickFormatter, TickFormatterOptions } from '../../utils/specs';
import { StackMode } from '../../utils/specs';
import { getAxesSpecForSpecId } from '../utils/spec';

const LEGEND_VALUE_FONT = {
  fontFamily: DEFAULT_FONT_FAMILY,
  fontVariant: 'normal',
  fontWeight: 400,
  fontStyle: 'normal',
} as const;

/**
 * Returns the widest formatted data value across all series, including deselected series.
 * The data scan is memoized independently of pointer updates to keep the legend stable on hover.
 * @internal
 */
export const getLongestLegendFormattedValueSelector = createCustomCachedSelector(
  [computeFullSeriesDomainsSelector, computeSeriesDomainsSelector, getAxisSpecsSelector, getSettingsSpecSelector],
  (fullDomains, currentDomains, axesSpecs, settings): string | undefined => {
    if (
      !settings.showLegend ||
      !settings.legendValues.includes(LegendValue.CurrentAndLastValue) ||
      settings.legendLayout !== 'list' ||
      shouldDisplayGridList(false, settings.legendPosition, settings.legendLayout) ||
      fullDomains.xDomain.type === ScaleType.Ordinal
    ) {
      return undefined;
    }

    return withTextMeasure((textMeasure) => {
      let result: string | undefined;
      let maxWidth = 0;
      const measured = new Set<string>();
      const consider = (formatted: string) => {
        if (!formatted || measured.has(formatted)) return;
        measured.add(formatted);
        // Legend values use tabular numerals; do not underestimate narrow proportional digits.
        const { width } = textMeasure(formatted.replaceAll(/\d/g, '0'), LEGEND_VALUE_FONT, 12, 1.5);
        if (result === undefined || width > maxWidth) {
          result = formatted;
          maxWidth = width;
        }
      };

      const considerValue = (
        value: number | null,
        formatter: TickFormatter<number>,
        options?: TickFormatterOptions,
      ) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return;
        consider(formatter(value));
        // Hover values pass timeZone, while the last-value legend uses the formatter without options.
        if (options) consider(formatter(value, options));
      };

      const scan = (domains: typeof fullDomains, percentagesOnly = false) => {
        for (const { spec, data, stackMode } of domains.formattedDataSeries) {
          if (spec.hideInLegend || (percentagesOnly && stackMode !== StackMode.Percentage)) continue;
          const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, settings.rotation);
          const formatter = spec.tickFormat ?? yAxis?.tickFormat ?? defaultTickFormatter;
          const options = spec.timeZone ? { timeZone: spec.timeZone } : undefined;
          const banded = isBandedSpec(spec);
          for (const datum of data) {
            considerValue(getDatumYValue(datum, false, banded, stackMode), formatter, options);
            if (banded) {
              considerValue(getDatumYValue(datum, true, banded, stackMode), formatter, options);
              if (stackMode === StackMode.Percentage && datum.y1 !== null && datum.y0 !== null) {
                considerValue(datum.y1 - datum.y0, formatter, options);
              }
            }
          }
        }
      };

      scan(fullDomains);
      // Deselection can change normalized percentage values, even though the raw data is unchanged.
      if (currentDomains !== fullDomains) scan(currentDomains, true);
      if (result !== undefined) consider('—');
      return result;
    });
  },
);
