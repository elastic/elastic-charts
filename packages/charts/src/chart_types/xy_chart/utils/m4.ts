/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * M4 reduction of rows sorted by x: returns the indices of the first, lowest, highest and last row of every run of
 * consecutive rows in the same pixel bin `floor(offset + scale * (x - origin))`, so a line through the kept rows
 * paints the same pixel bins as a line through all rows. A NaN y ends the run; of each run of NaN rows,
 * only the first and last in each pixel bin are kept, so a pointer snapping to the nearest kept row at a pixel bin
 * boundary finds the row it would find among all rows. Without `keepGaps`, a NaN y is skipped instead, so with a
 * `scale` of 0 the result summarizes the whole series in at most four rows.
 * @internal
 */
export function m4(
  xs: Float64Array,
  ys: Float64Array,
  scale: number,
  origin: number,
  offset: number,
  keepGaps = true,
): number[] {
  const kept: number[] = []; // indices of the kept rows, in row order
  // row indices of the open run, consecutive rows with a y in one pixel bin; there is no open run while first < 0
  let first = -1; // its first row
  let lo = -1; // its lowest row, the first one on ties
  let hi = -1; // its highest row, the first one on ties
  let last = -1; // its last row so far
  let loY = 0; // the y of its lowest row
  let hiY = 0; // the y of its highest row
  let runBin = NaN; // its pixel bin; NaN matches no bin, so the next row with a y opens a run
  let nullBin = NaN; // the pixel bin of the latest row with a missing y
  let lastNull = -1; // the latest row with a missing y after the first one in its run and pixel bin, -1 if there is none

  // keeps the open run's rows and closes the run
  const endRun = () => {
    if (first < 0) return;

    // append 1 to 4 indices to `kept`; preserves X order
    kept.push(first);
    if (first !== last) {
      const a = Math.min(lo, hi); // the earlier index of the two extreme values
      const b = Math.max(lo, hi); // the later index of the two extreme values
      if (a !== first) kept.push(a);
      if (b !== a && b !== last) kept.push(b);
      kept.push(last);
    }

    first = -1;
    runBin = NaN;
  };

  for (let i = 0; i < ys.length; i++) {
    const y = ys[i]!;
    const bin = Math.floor(offset + scale * (xs[i]! - origin)); // this row's pixel bin
    if (Number.isNaN(y)) {
      if (!keepGaps) continue;
      // the first missing y of a run in each pixel bin closes the open run and is kept, after the previous bin's last
      // missing y; the later ones wait in lastNull
      if (i > 0 && Number.isNaN(ys[i - 1]!) && bin === nullBin) {
        lastNull = i;
      } else {
        endRun();
        if (lastNull >= 0) kept.push(lastNull);
        lastNull = -1;
        kept.push(i);
        nullBin = bin;
      }
      continue;
    }
    // a y after a run of missing ys keeps the run's last row
    if (lastNull >= 0) {
      kept.push(lastNull);
      lastNull = -1;
    }
    if (bin !== runBin) {
      endRun();
      runBin = bin;
      first = lo = hi = i;
      loY = hiY = y;
    } else if (y < loY) {
      lo = i;
      loY = y;
    } else if (y > hiY) {
      hi = i;
      hiY = y;
    }
    last = i;
  }
  endRun();
  if (lastNull >= 0) kept.push(lastNull);
  return kept;
}
