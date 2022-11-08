/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const getEnrichedData = (rows: { epochMs: number; value?: number }[]) => {
  const stats = rows.reduce(
    (p, { epochMs, value }) => {
      const { minEpochMs, maxEpochMs, minValue, maxValue } = p;
      p.minEpochMs = Math.min(minEpochMs, epochMs);
      p.maxEpochMs = Math.max(maxEpochMs, epochMs);
      p.minValue = Math.min(minValue, value ?? minValue);
      p.maxValue = Math.max(maxValue, value ?? maxValue);
      return p;
    },
    {
      minEpochMs: Infinity,
      maxEpochMs: -Infinity,
      minValue: Infinity,
      maxValue: -Infinity,
    },
  );
  return { rows, stats };
};
