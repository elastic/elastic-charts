/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { BasicSeriesSpec } from './specs';
import { capitalizeFirst } from '../../../utils/text/text_utils';
import type { SeriesDomainsAndData } from '../state/utils/types';

function getDataSummary(seriesDomains: SeriesDomainsAndData): string {
  const dataCount = seriesDomains.formattedDataSeries[0]?.data?.length || 0;
  const xDomain = seriesDomains.xDomain;

  if (dataCount === 0) return '';

  if (xDomain?.type === 'ordinal') {
    return `with ${dataCount} ${dataCount === 1 ? 'category' : 'categories'}`;
  } else if (xDomain?.type === 'time') {
    return `with ${dataCount} time ${dataCount === 1 ? 'period' : 'periods'}`;
  }
  return `with ${dataCount} data ${dataCount === 1 ? 'point' : 'points'}`;
}

function getValueRangeContext(seriesDomains: SeriesDomainsAndData): string {
  const firstSeries = seriesDomains.formattedDataSeries[0];
  if (!firstSeries?.data || firstSeries.data.length === 0) {
    return '';
  }

  // Get actual data values, not the domain (which may include 0 for bar charts)
  const yValues = firstSeries.data.map((d) => d.y1 ?? d.y0 ?? 0).filter((val) => val !== null);
  if (yValues.length === 0) {
    return '';
  }

  const min = Math.min(...yValues);
  const max = Math.max(...yValues);

  if (min === max) {
    if (yValues.length === 1) {
      return `, value is ${min}`;
    }
    return `, all values are ${min}`;
  }
  return `, values ranging from ${min} to ${max}`;
}

/** @internal */
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

    const hasPercentageStacking = seriesSpecs.some((spec) => 'stackMode' in spec && spec.stackMode === 'percentage');

    const stackPrefix = hasStackedSeries ? (hasPercentageStacking ? 'percentage stacked' : 'stacked') : '';

    if (actualSeriesCount === 1) {
      const dataSummary = seriesDomains ? getDataSummary(seriesDomains) : '';
      const valueRange = seriesDomains ? getValueRangeContext(seriesDomains) : '';
      const contextInfo = dataSummary + valueRange;
      return capitalizeFirst(
        `${stackPrefix ? `${stackPrefix} ` : ''}${seriesType} chart${contextInfo ? ` ${contextInfo}` : ''}`,
      );
    } else {
      const chartTypeDescriptionStackChecked = `${stackPrefix ? `${stackPrefix} ` : ''}${seriesType} chart`;
      const countDescription = `with ${actualSeriesCount} ${seriesType}s`;

      const description = `${chartTypeDescriptionStackChecked} ${countDescription}`;
      const finalDescription =
        seriesNames.length > 0 && seriesNames.length <= 5 ? `${description}: ${seriesNames.join(', ')}` : description;
      return capitalizeFirst(finalDescription);
    }
  } else {
    const stackPrefix = hasStackedSeries ? 'stacked mixed' : 'mixed';
    return capitalizeFirst(`${stackPrefix} chart: ${Array.from(seriesTypes).join(' and ')} chart`);
  }
}
