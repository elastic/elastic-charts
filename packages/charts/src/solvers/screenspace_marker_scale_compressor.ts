/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Cartesian, Pixels, Ratio } from '../common/geometry';

/** @internal */
export type ArrayIndex = number;

/** @internal */
export interface ScaleCompression {
  bounds: ArrayIndex[];
  scaleMultiplier: Ratio;
}

/**
 * A set of Cartesian positioned items with screenspace size (eg. axis tick labels, or scatterplot points) are represented as:
 *   - a column vector of Cartesian positions in the domain (can be any unit)
 *   - a column vector of screenspace size (eg. widths in pixels) which has the same number of elements
 * The available room in the same screenspace units (practically, pixels) is supplied.
 *
 * Returns the scale multiplier, as well as the index of the elements determining (compressing) the scale, if solvable.
 * If not solvable, it returns a non-finite number in `scaleMultiplier` and no indices in `bounds`.
 * @internal
 */
export const screenspaceMarkerScaleCompressor = (
  domainPositions: Cartesian[],
  itemWidths: Array<[Pixels, Pixels]>,
  outerWidth: Pixels,
): ScaleCompression => {
  const result: ScaleCompression = { bounds: [], scaleMultiplier: Infinity };
  const itemCount = Math.min(domainPositions.length, itemWidths.length);
  for (let left = 0; left < itemCount; left++) {
    for (let right = 0; right < itemCount; right++) {
      const domainLeft = domainPositions[left] ?? NaN;
      const domainRight = domainPositions[right] ?? NaN;
      if (domainLeft > domainRight) continue; // must adhere to left <= right

      const range = outerWidth - (itemWidths[left]?.[0] ?? NaN) - (itemWidths[right]?.[1] ?? NaN); // negative if not enough room
      const domain = domainRight - domainLeft; // always non-negative and finite
      const scaleMultiplier = range / domain; // may not be finite, and that's OK

      if (scaleMultiplier < result.scaleMultiplier || Number.isNaN(scaleMultiplier)) {
        result.bounds[0] = left;
        result.bounds[1] = right;
        result.scaleMultiplier = scaleMultiplier; // will persist a Number.finite() value for solvable pairs
      }
    }
  }

  return result;
};
