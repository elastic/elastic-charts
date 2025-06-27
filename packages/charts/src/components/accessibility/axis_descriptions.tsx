/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { AxisSpec } from '../../chart_types/xy_chart/utils/specs';

interface AxisDescriptionsProps {
  axisSpecs: AxisSpec[];
  seriesDomains?: SeriesDomainsAndData;
}

/** @internal */
export function AxisDescriptions({ axisSpecs, seriesDomains }: AxisDescriptionsProps) {
  if (!axisSpecs.length || !seriesDomains) return null;

  const axisDescriptions: string[] = [];
  const { xDomain, yDomains } = seriesDomains;

  // Process X axis
  const xAxisSpecs = axisSpecs.filter((spec) => spec.position === 'bottom' || spec.position === 'top');
  if (xAxisSpecs.length > 0 && xDomain) {
    const xAxisSpec = xAxisSpecs[0]!; // Use first X axis for description
    const axisTitle = xAxisSpec.title || 'X';
    let rangeDescription = '';

    switch (xDomain.type) {
      case 'ordinal': {
        // For categorical data, show number of categories
        rangeDescription = `with ${xDomain.domain.length} categories`;

        break;
      }
      case 'time': {
        // For time data, show time range
        const minTime = new Date(xDomain.domain[0]);
        const maxTime = new Date(xDomain.domain[1]);
        const formatTime = (date: Date) => {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          });
        };
        rangeDescription = `from ${formatTime(minTime)} to ${formatTime(maxTime)}`;

        break;
      }
      case 'linear': {
        // For numeric data, show numeric range
        const [min, max] = xDomain.domain;
        rangeDescription = `from ${min} to ${max}`;

        break;
      }
      // No default
    }

    axisDescriptions.push(
      `The chart has 1 X axis displaying ${axisTitle}${rangeDescription ? ` ${rangeDescription}` : ''}.`,
    );
  }

  // Process Y axes
  const yAxisSpecs = axisSpecs.filter((spec) => spec.position === 'left' || spec.position === 'right');
  const yAxisCount = yAxisSpecs.length;

  if (yAxisCount > 0 && yDomains.length > 0) {
    // Get the primary Y domain for range information
    const primaryYDomain = yDomains[0];
    const yAxisSpec = yAxisSpecs[0]!; // Use first Y axis for description
    const axisTitle = yAxisSpec.title || 'Values';

    let rangeDescription = '';
    if (primaryYDomain && primaryYDomain.domain.length >= 2) {
      const [min, max] = primaryYDomain.domain;
      rangeDescription = `. Data ranges from ${min} to ${max}`;
    }

    const yAxisDescription =
      yAxisCount === 1
        ? `The chart has 1 Y axis displaying ${axisTitle}${rangeDescription}.`
        : `The chart has ${yAxisCount} Y axes${rangeDescription}.`;

    axisDescriptions.push(yAxisDescription);
  }

  if (axisDescriptions.length === 0) return null;

  return (
    <>
      {axisDescriptions.map((description, index) => (
        <div key={`axis-desc-${index}`}>{description}</div>
      ))}
    </>
  );
}
