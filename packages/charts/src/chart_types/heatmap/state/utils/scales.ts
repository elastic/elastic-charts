/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Predicate } from '../../../../common/predicate';
import { ScaleType } from '../../../../scales/constants';
import { Logger } from '../../../../utils/logger';
import type { HeatmapSpec, OrdinalScale, RasterTimeScale } from '../../specs/heatmap';

/** @internal */
export type ResolvedOrdinalScale = Required<OrdinalScale>;

/** @internal */
export type ResolvedHeatmapScale = RasterTimeScale | ResolvedOrdinalScale;

/** @internal */
export type RasterScale = RasterTimeScale;

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
      Logger.warn(
        'The heatmap linear scale is deprecated and rendered as an ordinal scale preserving the data order. Use an ordinal scale instead.',
      );
      return { type: ScaleType.Ordinal, sort: Predicate.DataIndex };
    case ScaleType.Ordinal:
    default:
      return { type: ScaleType.Ordinal, sort: scale.sort ?? fallbackSort };
  }
}

/**
 * Raster scales render uniform bins aligned to the bin edges.
 * @internal
 */
export function isRasterScale(
  scale: ResolvedHeatmapScale | HeatmapSpec['xScale'] | HeatmapSpec['yScale'],
): scale is RasterScale {
  return scale.type === ScaleType.Time;
}
