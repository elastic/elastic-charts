/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RasterScale } from './raster';
import { isRasterScale } from './raster';
import { Predicate } from '../../../../common/predicate';
import { ScaleType } from '../../../../scales/constants';
import { Logger } from '../../../../utils/logger';
import type { HeatmapSpec, OrdinalScale } from '../../specs/heatmap';

/** @internal */
export type ResolvedOrdinalScale = Required<OrdinalScale>;

/** @internal */
export type ResolvedHeatmapScale = RasterScale | ResolvedOrdinalScale;

/**
 * Normalizes a heatmap axis scale, applying deprecated fallbacks.
 * @internal
 */
export function resolveHeatmapScale(
  scale: HeatmapSpec['xScale'] | HeatmapSpec['yScale'],
  fallbackSort: Predicate,
): ResolvedHeatmapScale {
  switch (scale.type) {
    case ScaleType.Time:
      return scale;
    case ScaleType.Linear:
      if (isRasterScale(scale)) return scale;
      Logger.warn(
        'A heatmap linear scale without a positive interval is deprecated and rendered as an ordinal scale preserving the data order. Use an ordinal scale, or set the interval of the bins.',
      );
      return { type: ScaleType.Ordinal, sort: Predicate.DataIndex };
    case ScaleType.Ordinal:
    default:
      return { type: ScaleType.Ordinal, sort: scale.sort ?? fallbackSort };
  }
}
