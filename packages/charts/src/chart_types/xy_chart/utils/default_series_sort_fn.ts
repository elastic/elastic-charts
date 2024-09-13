/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DataSeries } from './series';

/**
 * Return the default sorting used for XY series.
 * Ordered by group insert order, then first stacked, after non stacked.
 * @internal
 */
export function defaultXYSeriesSort(a: DataSeries, b: DataSeries) {
  if (a.groupId !== b.groupId) {
    return a.sortOrder - b.sortOrder;
  }

  if (a.isStacked && !b.isStacked) {
    return -1; // a first then b
  }
  if (!a.isStacked && b.isStacked) {
    return 1; // b first then a
  }
  return a.sortOrder - b.sortOrder;
}

/**
 * Return the default sorting used for XY series.
 * Ordered by group insert order, then first stacked, after non stacked.
 * Stacked series are sorted by their insert order
 * @internal
 */
export function defaultXYLegendSeriesSort(a?: DataSeries, b?: DataSeries) {
  if (!a || !b) return 0;
  if (a.groupId !== b.groupId) {
    return a.sortOrder - b.sortOrder;
  }

  if (a.isStacked && !b.isStacked) {
    return -1; // a first then b
  }
  if (!a.isStacked && b.isStacked) {
    return 1; // b first then a
  }
  return a.sortOrder - b.sortOrder;
}
