/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const environmentUrl = process.env.ENV_URL;

/**
 * Chart renderer under test, selected with `--renderer=<canvas|svg>` on `yarn test` (see scripts/start.sh)
 * or the `VRT_RENDERER` env variable. Anything but `svg` is `canvas`.
 */
export const renderer: 'canvas' | 'svg' = process.env.VRT_RENDERER === 'svg' ? 'svg' : 'canvas';

/**
 * The canvas baselines in `screenshots` are the committed reference. An svg run writes the same stories
 * into `screenshots_svg`, which git ignores: run it with `-u` so the screenshots are written, and compare
 * them against the canvas baselines (see scripts/image_distance.ts) instead of keeping a second baseline set.
 */
export const snapshotDir = renderer === 'svg' ? 'screenshots_svg' : 'screenshots';
