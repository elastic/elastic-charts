/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const environmentUrl = process.env.ENV_URL;

/**
 * Chart renderer under test, selected with `--renderer=<canvas|svg|headless>` on `pnpm test` (see
 * scripts/start.sh) or the `VRT_RENDERER` env variable. Anything but `svg` and `headless` is `canvas`.
 * `headless` shows, in place of each chart, the markup that `renderChart` of `@elastic/charts/headless`
 * returns for it; it is meant for the tests of all.test.ts, which need no interaction.
 */
export const renderer: 'canvas' | 'svg' | 'headless' =
  process.env.VRT_RENDERER === 'svg' || process.env.VRT_RENDERER === 'headless' ? process.env.VRT_RENDERER : 'canvas';

/**
 * The canvas baselines in `screenshots` are the committed reference. An svg or a headless run writes the same
 * stories into `screenshots_svg` or `screenshots_headless`, which git ignores: run it with `-u` so the
 * screenshots are written, and compare them against the canvas baselines (see scripts/image_distance.ts)
 * instead of keeping more baseline sets.
 */
export const snapshotDir = renderer === 'canvas' ? 'screenshots' : `screenshots_${renderer}`;
