/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { ScreenReaderDescription } from './screen_reader_description';
import { ScreenReaderItems } from './screen_reader_items';
import { ChartType } from '../../chart_types';
import { computeSeriesDomainsSelector } from '../../chart_types/xy_chart/state/selectors/compute_series_domains';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from '../../chart_types/xy_chart/state/selectors/get_specs';
import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { BasicSeriesSpec, AxisSpec } from '../../chart_types/xy_chart/utils/specs';
import type { ChartSpecificScreenReaderData } from '../../state/chart_selectors';
import type { GlobalChartState } from '../../state/chart_state';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS } from '../../state/selectors/get_accessibility_config';
import { getInternalChartStateSelector } from '../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getScreenReaderSummarySelector } from '../../state/selectors/get_screen_reader_summary';

interface ScreenReaderSummaryStateProps {
  a11ySettings: A11ySettings;
  screenReaderData?: ChartSpecificScreenReaderData;
  chartTypeDescription: string;
  seriesSpecs?: BasicSeriesSpec[];
  axisSpecs?: AxisSpec[];
  seriesDomains?: SeriesDomainsAndData;
  chartType: ChartType | null;
}

const ScreenReaderSummaryComponent = ({
  a11ySettings,
  screenReaderData,
  chartTypeDescription,
  seriesSpecs,
  axisSpecs,
  seriesDomains,
}: ScreenReaderSummaryStateProps) => {
  // Create a consolidated summary text for better screen reader experience
  const createConsolidatedSummary = () => {
    const parts: string[] = [];

    // Chart type and series information
    if (chartTypeDescription && seriesSpecs) {
      const seriesTypes = new Set<string>();
      seriesSpecs.forEach((spec) => seriesTypes.add(spec.seriesType));

      const seriesNames = seriesSpecs
        .map((spec) => {
          if (typeof spec.name === 'string') return spec.name;
          if (typeof spec.name === 'object' && spec.name?.names) return 'Series';
          return `Series ${spec.id}`;
        })
        .filter((name) => name);

      if (seriesTypes.size === 1) {
        const seriesType = Array.from(seriesTypes)[0];
        const count = seriesSpecs.length;
        if (count === 1) {
          parts.push(`${seriesType} chart`);
        } else {
          const description = `${seriesType} chart with ${count} ${seriesType}s`;
          if (seriesNames.length > 0 && seriesNames.length <= 5) {
            parts.push(`${description}: ${seriesNames.join(', ')}`);
          } else {
            parts.push(description);
          }
        }
      } else {
        parts.push(`Mixed chart: ${Array.from(seriesTypes).join(' and ')} chart`);
      }
    } else if (chartTypeDescription) {
      parts.push(chartTypeDescription);
    }

    // Axis descriptions
    if (axisSpecs && axisSpecs.length > 0 && seriesDomains) {
      const { xDomain, yDomains } = seriesDomains;

      // X axis description
      const xAxisSpecs = axisSpecs.filter((spec) => spec.position === 'bottom' || spec.position === 'top');
      if (xAxisSpecs.length > 0 && xDomain) {
        const xAxisSpec = xAxisSpecs[0]!;
        const axisTitle = xAxisSpec.title || 'X';
        let rangeDescription = '';

        switch (xDomain.type) {
          case 'ordinal':
            rangeDescription = `with ${xDomain.domain.length} categories`;
            break;
          case 'time': {
            const minTime = new Date(xDomain.domain[0]);
            const maxTime = new Date(xDomain.domain[1]);
            const timeDiff = maxTime.getTime() - minTime.getTime();
            
            // Choose granularity based on time span
            const formatTime = (date: Date) => {
              if (timeDiff < 24 * 60 * 60 * 1000) { // Less than 1 day
                return date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });
              } else if (timeDiff < 7 * 24 * 60 * 60 * 1000) { // Less than 1 week
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                });
              } else if (timeDiff < 365 * 24 * 60 * 60 * 1000) { // Less than 1 year
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
              } else { // 1 year or more
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                });
              }
            };
            rangeDescription = `from ${formatTime(minTime)} to ${formatTime(maxTime)}`;
            break;
          }
          case 'linear':
            const [min, max] = xDomain.domain;
            rangeDescription = `from ${min} to ${max}`;
            break;
        }

        parts.push(`X axis displays ${axisTitle}${rangeDescription ? ` ${rangeDescription}` : ''}`);
      }

      // Y axes description
      const yAxisSpecs = axisSpecs.filter((spec) => spec.position === 'left' || spec.position === 'right');
      if (yAxisSpecs.length > 0 && yDomains.length > 0) {
        const primaryYDomain = yDomains[0];
        const yAxisSpec = yAxisSpecs[0]!;
        const axisTitle = yAxisSpec.title || 'Values';

        let rangeDescription = '';
        if (primaryYDomain && primaryYDomain.domain.length >= 2) {
          const [min, max] = primaryYDomain.domain;
          rangeDescription = `, ranging from ${min} to ${max}`;
        }

        const yAxisDescription =
          yAxisSpecs.length === 1
            ? `Y axis displays ${axisTitle}${rangeDescription}`
            : `${yAxisSpecs.length} Y axes${rangeDescription}`;

        parts.push(yAxisDescription);
      }
    }

    return `${parts.join('. ')}.`;
  };

  const consolidatedSummary = createConsolidatedSummary();

  return (
    <figcaption
      className="echScreenReaderOnly"
      id={`${a11ySettings.descriptionId}-summary`}
      data-testid="echScreenReaderSummary"
    >
      {/* Consolidated summary for better UX */}
      <div>{consolidatedSummary}</div>
      <ScreenReaderDescription {...a11ySettings} />
      <ScreenReaderItems {...a11ySettings} screenReaderItems={screenReaderData?.screenReaderItems} />
    </figcaption>
  );
};

const DEFAULT_SCREEN_READER_SUMMARY: ScreenReaderSummaryStateProps = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  chartTypeDescription: '',
  seriesSpecs: undefined,
  axisSpecs: undefined,
  seriesDomains: undefined,
  chartType: null,
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryStateProps => {
  const { a11ySettings, screenReaderData } = getScreenReaderSummarySelector(state);
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState === null || getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }

  // Get XY chart data when available
  let seriesSpecs: BasicSeriesSpec[] | undefined;
  let axisSpecs: AxisSpec[] | undefined;
  let seriesDomains: SeriesDomainsAndData | undefined;

  try {
    // Only get XY chart selectors if this is an XY chart
    if (state.chartType === ChartType.XYAxis) {
      seriesSpecs = getSeriesSpecsSelector(state);
      axisSpecs = getAxisSpecsSelector(state);
      seriesDomains = computeSeriesDomainsSelector(state);
    }
  } catch {
    // Silently handle any selector errors - these selectors may not apply to all chart types
  }

  return {
    chartTypeDescription: internalChartState.getChartTypeDescription(state),
    a11ySettings,
    screenReaderData,
    seriesSpecs,
    axisSpecs,
    seriesDomains,
    chartType: state.chartType,
  };
};

/** @internal */
export const ScreenReaderSummary = memo(connect(mapStateToProps)(ScreenReaderSummaryComponent));
