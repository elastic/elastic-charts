/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RandomNumberGenerator } from '@elastic/charts/src/utils/data_generators/data_generator';

/** Random values in [0, 1] that `sample` interpolates between */
export function noiseTable(rng: RandomNumberGenerator, size: number) {
  return Array.from({ length: size }, () => rng(0, 1, 4));
}

/** Smooth noise at `x`, interpolating the table entries around it and repeating every `table.length` */
export function sample(table: number[], x: number) {
  const i = Math.floor(x);
  const t = x - i;
  const s = t * t * (3 - 2 * t);
  const n = table.length;
  return table[i % n]! + (table[(i + 1) % n]! - table[i % n]!) * s;
}
