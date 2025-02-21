/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RandomNumberGenerator } from './data_generator';

/** @internal */
export class Simple1DNoise {
  private maxVertices: number;

  private maxVerticesMask: number;

  private amplitude: number;

  private scale: number;

  private getRandomNumber: RandomNumberGenerator;

  constructor(randomNumberGenerator: RandomNumberGenerator, maxVertices = 256, amplitude = 5.1, scale = 0.6) {
    this.getRandomNumber = randomNumberGenerator;
    this.maxVerticesMask = maxVertices - 1;
    this.amplitude = amplitude;
    this.scale = scale;
    this.maxVertices = maxVertices;
  }

  getValue(x: number) {
    const r = new Array(this.maxVertices).fill(0).map(() => this.getRandomNumber(0, 1, 5, true));

    const scaledX = x * this.scale;
    const xFloor = Math.floor(scaledX);
    const t = scaledX - xFloor;
    const tRemapSmoothstep = t * t * (3 - 2 * t);

    const xMin = xFloor & this.maxVerticesMask;
    const xMax = (xMin + 1) & this.maxVerticesMask;

    const y = this.lerp(r[xMin] ?? 0, r[xMax] ?? 0, tRemapSmoothstep);

    return y * this.amplitude;
  }

  private lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
  }
}
