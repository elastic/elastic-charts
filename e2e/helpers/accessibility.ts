/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Common DOM selectors for accessibility testing
 */
export const A11Y_SELECTORS = {
  screenReaderOnly: '.echScreenReaderOnly',
  figcaption: 'figcaption.echScreenReaderOnly',
  description: '.echScreenReaderOnly p',
} as const;

/**
 * Regular expression patterns for common chart types' accessibility descriptions
 */
export const A11Y_PATTERNS = {
  barChart: /^(?:Stacked )?Bar chart with \d+ (?:data points?|categories?|bars?)/,
  lineChart: /^(?:Stacked )?Line chart with \d+ (?:lines?|data points?)/,
  areaChart: /^(?:Stacked )?Area chart with \d+ (?:areas?|data points?)/,
  pieChart: /^Pie chart with \d+ slices?/,
  sunburstChart: /^Sunburst chart with \d+ layers?/,
  treemapChart: /^Treemap chart with \d+ rectangles?/,
  heatmapChart: /^Heatmap chart with \d+ cells?/,
  goalChart: /^Goal chart/,
  metricChart: /^Metric chart/,
  bubbleChart: /^Bubble chart with \d+ bubbles?/,
  // Generic pattern for any chart with value ranges
  valueRange: /values? ranging from -?\d+(?:\.\d+)? to -?\d+(?:\.\d+)?/,
  // Pattern for axis descriptions
  axisDescription: /[XY] axis displays/,
} as const;

/**
 * Helper function to create chart-specific accessibility patterns
 */
export function createChartA11yPattern(chartType: string, seriesCount?: number): RegExp {
  const basePattern = `^(?:Stacked )?${chartType} chart`;
  const countPattern = seriesCount ? ` with ${seriesCount}` : ` with \\d+`;
  
  switch (chartType.toLowerCase()) {
    case 'bar':
      return new RegExp(`${basePattern}${countPattern} (?:categories?|bars?)`);
    case 'line':
      return new RegExp(`${basePattern}${countPattern} lines?`);
    case 'area':
      return new RegExp(`${basePattern}${countPattern} areas?`);
    case 'pie':
      return new RegExp(`${basePattern}${countPattern} slices?`);
    case 'sunburst':
      return new RegExp(`${basePattern}${countPattern} layers?`);
    case 'treemap':
      return new RegExp(`${basePattern}${countPattern} rectangles?`);
    case 'heatmap':
      return new RegExp(`${basePattern}${countPattern} cells?`);
    case 'bubble':
      return new RegExp(`${basePattern}${countPattern} bubbles?`);
    default:
      return new RegExp(`${basePattern}`);
  }
}

/**
 * Helper function to create value range pattern
 */
export function createValueRangePattern(min?: number, max?: number): RegExp {
  if (min !== undefined && max !== undefined) {
    return new RegExp(`values? ranging from ${min} to ${max}`);
  }
  return A11Y_PATTERNS.valueRange;
}

/**
 * Helper function to create axis description pattern
 */
export function createAxisDescriptionPattern(axisType: 'X' | 'Y', title?: string): RegExp {
  const basePattern = `${axisType} axis displays`;
  if (title) {
    return new RegExp(`${basePattern} ${title}`);
  }
  return new RegExp(basePattern);
}