/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TimeBin, TimeRaster } from './rasters';

const MAX_TIME_TICK_COUNT = 50; // this doesn't do much for narrow charts, but limits tick count to a maximum on wider ones
const WIDTH_FUDGE = 1.05; // raster bin widths are sometimes approximate, but there's no raster that's just 5% denser/sparser, so it's safe

/** @internal */
export const notTooDense = (
  domainFrom: number,
  domainTo: number,
  binWidth: number,
  cartesianWidth: number,
  maxTickCount = MAX_TIME_TICK_COUNT,
) => (raster: TimeRaster<TimeBin>) => {
  const domainInSeconds = domainTo - domainFrom;
  const pixelsPerSecond = cartesianWidth / domainInSeconds;
  return (
    pixelsPerSecond > raster.minimumPixelsPerSecond &&
    raster.approxWidthInMs * WIDTH_FUDGE >= binWidth &&
    (domainInSeconds * 1000) / maxTickCount <= raster.approxWidthInMs
  );
};
