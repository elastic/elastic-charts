/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { BasicSeriesSpec } from '../../chart_types/xy_chart/utils/specs';

export function createChartTypeDescription(
  chartTypeDescription: string,
  seriesSpecs?: BasicSeriesSpec[],
  seriesDomains?: SeriesDomainsAndData,
): string {
  if (!chartTypeDescription || !seriesSpecs || !seriesDomains?.formattedDataSeries) {
    return chartTypeDescription;
  }

  const seriesTypes = new Set<string>();
  seriesSpecs.forEach((spec) => seriesTypes.add(spec.seriesType));

  const actualSeriesCount = seriesDomains.formattedDataSeries.length;
  const renderedSeries = seriesDomains.formattedDataSeries;

  const seriesNames = renderedSeries
    .map((series) => {
      const spec = seriesSpecs.find((s) => s.id === series.specId);
      if (spec && typeof spec.name === 'string') return spec.name;
      if (series.splitAccessors && series.splitAccessors.size > 0) {
        const splitValues = Array.from(series.splitAccessors.values());
        return splitValues.join(' ');
      }
      return `Series ${series.specId}`;
    })
    .filter((name) => name);

  const hasStackedSeries = seriesSpecs.some(
    (spec) => 'stackAccessors' in spec && spec.stackAccessors && spec.stackAccessors.length > 0,
  );

  if (seriesTypes.size === 1) {
    const seriesType = Array.from(seriesTypes)[0];

    const hasPercentageStacking = seriesSpecs.some(
      (spec) => 'stackMode' in spec && spec.stackMode === 'percentage',
    );

    const stackPrefix = hasStackedSeries ? (hasPercentageStacking ? 'percentage stacked' : 'stacked') : '';

    if (actualSeriesCount === 1) {
      return `${stackPrefix ? `${stackPrefix} ` : ''}${seriesType} chart`;
    } else {
      const chartTypeDescriptionStackChecked = `${stackPrefix ? `${stackPrefix} ` : ''}${seriesType} chart`;
      const countDescription = `with ${actualSeriesCount} ${seriesType}s`;

      const description = `${chartTypeDescriptionStackChecked} ${countDescription}`;
      if (seriesNames.length > 0 && seriesNames.length <= 5) {
        return `${description}: ${seriesNames.join(', ')}`;
      } else {
        return description;
      }
    }
  } else {
    const stackPrefix = hasStackedSeries ? 'stacked mixed' : 'mixed';
    return `${stackPrefix} chart: ${Array.from(seriesTypes).join(' and ')} chart`;
  }
}