/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { AxisSpec } from '../../chart_types/xy_chart/utils/specs';

/** @internal */
export function createAxisDescriptions(axisSpecs: AxisSpec[], seriesDomains: SeriesDomainsAndData): string[] {
  const descriptions: string[] = [];
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

        const formatTime = (date: Date) => {
          if (timeDiff < 24 * 60 * 60 * 1000) {
            // Less than 1 day
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });
          } else if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
            // Less than 1 week
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
            });
          } else if (timeDiff < 365 * 24 * 60 * 60 * 1000) {
            // Less than 1 year
            return date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
          } else {
            // 1 year or more
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

    descriptions.push(`X axis displays ${axisTitle}${rangeDescription ? ` ${rangeDescription}` : ''}`);
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

    descriptions.push(yAxisDescription);
  }

  return descriptions;
}
