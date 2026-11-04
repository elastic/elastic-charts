/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import seedrandom from 'seedrandom';

import type { RandomNumberGenerator } from '../utils/data_generators/data_generator';
import { DataGenerator } from '../utils/data_generators/data_generator';

/**
 * Forces object to be partial type for mocking tests
 *
 * SHOULD NOT BE USED OUTSIDE OF TESTS!!!
 *
 * @param obj partial object type
 * @internal
 */
export const forcedType = <T extends Record<string, unknown>>(obj: Partial<T>): T => obj as T;

/**
 * Returns rng seed from `process.env`
 * @internal
 */
export const getRNGSeed = (fallback?: string): string | undefined =>
  process.env.RNG_SEED ?? (process.env.VRT === 'true' ? 'elastic-charts' : fallback);

/**
 * Re-seed callbacks of the seeded generators created in VRT mode, see `resetRandomNumberGenerators`
 */
const seededGeneratorResets = new Set<() => void>();

const registerReset = (reset: () => void) => {
  if (process.env.VRT === 'true') seededGeneratorResets.add(reset);
};

/**
 * Restarts every seeded generator created so far from its seed. The VRT page calls this when it
 * switches story without reloading the document, so a story module whose generator lives at
 * module level produces the same data on every mount, as it would on a fresh page load.
 * @internal
 */
export const resetRandomNumberGenerators = () => {
  seededGeneratorResets.forEach((reset) => reset());
};

/**
 * Returns rng function with optional `min`, `max` and `fractionDigits` params
 *
 * @param string seed for deterministic algorithm
 * @internal
 */
export const getRandomNumberGenerator = (seed = getRNGSeed()): RandomNumberGenerator => {
  let rng = seedrandom(seed);
  registerReset(() => {
    rng = seedrandom(seed);
  });

  /**
   * Random number generator
   *
   * @param  {} min=0
   * @param  {} max=1
   * @param  {} fractionDigits=0
   */
  return function randomNumberGenerator(min = 0, max = 1, fractionDigits = 0, inclusive = true) {
    const precision = Math.pow(10, Math.max(fractionDigits, 0));
    const scaledMax = max * precision;
    const scaledMin = min * precision;
    const offset = inclusive ? 1 : 0;
    const num = Math.floor(rng() * (scaledMax - scaledMin + offset)) + scaledMin;

    return num / precision;
  };
};

/** @internal */
export class SeededDataGenerator extends DataGenerator {
  constructor(frequency = 500, seed?: string) {
    super(frequency, getRandomNumberGenerator(seed));
  }
}

/**
 * Returns random array or object value
 * @internal
 */
export const getRandomEntryFn = (seed = getRNGSeed()) => {
  let rng = seedrandom(seed);
  registerReset(() => {
    rng = seedrandom(seed);
  });

  return function getRandomEntryClosure<T>(entries: T[] | Record<string, T>) {
    if (Array.isArray(entries)) {
      const index = Math.floor(rng() * entries.length);

      return entries[index];
    }

    const keys = Object.keys(entries);
    const index = Math.floor(rng() * keys.length);
    const key = keys[index]!;

    return entries[key];
  };
};

export function shuffle<T>(arr: T[]): T[] {
  const rng = getRandomNumberGenerator();
  const newArr = [...arr];

  for (let index = 0; index < arr.length; index++) {
    const randomIndex = rng(0, arr.length);
    // And swap current index value with random index value
    const swapValue = newArr[randomIndex];
    newArr[randomIndex] = newArr[index]!;
    newArr[index] = swapValue!;
  }

  return newArr;
}
