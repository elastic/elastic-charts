/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Simple1DNoise } from './simple_noise';

/** @public */
export type RandomNumberGenerator = (
  min?: number,
  max?: number,
  fractionDigits?: number,
  inclusive?: boolean,
) => number;

function defaultRNG(min = 0, max = 1, fractionDigits = 0, inclusive = true) {
  const precision = Math.pow(10, Math.max(fractionDigits, 0));
  const scaledMax = max * precision;
  const scaledMin = min * precision;
  const offset = inclusive ? 1 : 0;
  const num = Math.floor(Math.random() * (scaledMax - scaledMin + offset)) + scaledMin;

  return num / precision;
}

const fillGroups = (n: number) => new Array(n).fill(0).map((_, i) => String.fromCharCode(97 + i));

/** @public */
export class DataGenerator {
  private randomNumberGenerator: RandomNumberGenerator;

  private generator: Simple1DNoise;

  private frequency: number;

  constructor(frequency = 500, randomNumberGenerator: RandomNumberGenerator = defaultRNG) {
    this.randomNumberGenerator = randomNumberGenerator;
    this.generator = new Simple1DNoise(this.randomNumberGenerator);
    this.frequency = frequency;
  }

  generateBasicSeries(totalPoints = 50, offset = 0, amplitude = 1) {
    const dataPoints = new Array(totalPoints).fill(0).map((_, i) => ({
      x: i,
      y: (this.generator.getValue(i) + offset) * amplitude,
    }));
    return dataPoints;
  }

  generateSimpleSeries(totalPoints = 50, groupIndex = 1, groupPrefix = '') {
    const group = String.fromCharCode(97 + groupIndex);
    const dataPoints = new Array(totalPoints).fill(0).map((_, i) => ({
      x: i,
      y: 3 + Math.sin(i / this.frequency) + this.generator.getValue(i),
      g: `${groupPrefix}${group}`,
    }));
    return dataPoints;
  }

  generateGroupedSeries(totalPoints = 50, totalGroups = 2, groupPrefix = '') {
    const groups = new Array(totalGroups).fill(0).map((_, i) => this.generateSimpleSeries(totalPoints, i, groupPrefix));
    return groups.reduce((acc, curr) => [...acc, ...curr]);
  }

  generateRandomSeries(totalPoints = 50, groupIndex = 1, groupPrefix = '') {
    const group = String.fromCharCode(97 + groupIndex);
    const dataPoints = new Array(totalPoints).fill(0).map(() => ({
      x: this.randomNumberGenerator(0, 100),
      y: this.randomNumberGenerator(0, 100),
      z: this.randomNumberGenerator(0, 100),
      g: `${groupPrefix}${group}`,
    }));
    return dataPoints;
  }

  generateRandomGroupedSeries(totalPoints = 50, totalGroups = 2, groupPrefix = '') {
    const groups = new Array(totalGroups).fill(0).map((_, i) => this.generateRandomSeries(totalPoints, i, groupPrefix));
    return groups.reduce((acc, curr) => [...acc, ...curr]);
  }

  /**
   * Generate data given a list or number of vertical and/or horizontal panels
   */
  generateSMGroupedSeries<T extends Record<string, any>>(
    verticalGroups: Array<number | string> | number,
    horizontalGroups: Array<number | string> | number,
    seriesGenerator: (h: string | number, v: string | number) => T[],
  ) {
    const vGroups = typeof verticalGroups === 'number' ? fillGroups(verticalGroups) : verticalGroups;
    const hGroups = typeof horizontalGroups === 'number' ? fillGroups(horizontalGroups) : horizontalGroups;

    return vGroups.flatMap((v) => {
      return hGroups.flatMap((h) => {
        return seriesGenerator(h, v).map((row) => ({
          h,
          v,
          ...row,
        }));
      });
    });
  }
}
