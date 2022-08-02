/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// @ts-noCheck

/** @internal */
export const dataSource = Symbol('dataSource');

/** @internal */
export const getEnrichedData = (rows) => {
  const stats = rows.reduce(
    (p, { epochMs, value }) => {
      const { minEpochMs, maxEpochMs, minValue, maxValue } = p;
      p.minEpochMs = Math.min(minEpochMs, epochMs);
      p.maxEpochMs = Math.max(maxEpochMs, epochMs);
      p.minValue = Math.min(minValue, value);
      p.maxValue = Math.max(maxValue, value);
      return p;
    },
    {
      minEpochMs: Infinity,
      maxEpochMs: -Infinity,
      minValue: Infinity,
      maxValue: -Infinity,
    },
  );
  // console.log({ from: new Date(stats.minEpochMs), to: new Date(stats.maxEpochMs), count: rows.length })
  return { rows, stats };
};
