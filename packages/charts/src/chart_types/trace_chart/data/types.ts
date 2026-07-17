/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TraceDatum, TraceActiveSegment } from '../trace_api';

/**
 * A span prepared for rendering: filtered by `traceId`, projected onto the x-scale
 * (epoch ms under 'time'; elapsed-from-zero under 'linear'), with `activeSegments`
 * and `meta` guaranteed to be present regardless of the source datum.
 * @internal
 */
export interface NormalizedSpan {
  id: string;
  name: string;
  parentId?: string;
  traceId?: string;
  /** ms: epoch (xScaleType 'time') or relative-from-domain-min (xScaleType 'linear') */
  start: number;
  end: number;
  /**
   * Active-execution segments (the solid marks in each lane). Empty until `resolveActive` fills
   * them with self-time derivation (ADR 0003); copied from TraceDatum.activeSegments if the caller
   * supplied them explicitly, with `color` resolved to the label-palette color (or the explicit
   * per-segment override) by the normalize pipeline.
   *
   * Uses the public `TraceActiveSegment` type directly — the internal shape is identical, and
   * sharing the type eliminates a parallel anonymous struct that would have to be kept in sync.
   */
  activeSegments: TraceActiveSegment[];
  color?: TraceActiveSegment['color'];
  /** The original TraceDatum; exposed to tooltip datum and element-event callbacks. */
  meta: TraceDatum;
}
