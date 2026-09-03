/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TraceDatum, TraceActiveSegment, TraceSpanBadge } from '../trace_api';

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
  /**
   * Present when normalization translated this span's timestamps to correct detected clock skew.
   * The original recorded times remain available on `meta.start` / `meta.end`.
   */
  skewCorrected?: true;
  /**
   * Present on every span whose recorded `parentId` is absent from its selected trace group
   * (a **partial trace**; see Spec 26 / ADR 0028). Recorded `parentId` and `meta` are never
   * rewritten — this is disclosure-only provenance surfaced to tooltip/SR/interaction payloads.
   */
  orphaned?: true;
  /**
   * Synthetic **display parent** assigned to an orphan so it can be placed beneath its trace
   * group's elected root. Used only by display-topology operations (lane ordering/depth, collapse
   * rollups, clock-skew placement, SR indentation) via {@link displayParentId} — never by
   * source-topology self time, and never exposed as recorded `parentId`.
   */
  reparentedToSpanId?: string;
  /**
   * Internal-only: this orphan was elected as its trace group's display root (no recorded root
   * existed). It retains `orphaned` and has no `reparentedToSpanId`. Lets presentation distinguish
   * the elected fallback root from synthetically reparented orphans. Never added to public payloads.
   */
  fallbackRoot?: true;
  /** The original TraceDatum; exposed to tooltip datum and element-event callbacks. */
  meta: TraceDatum;
  /**
   * Structurally-valid Span badges derived from this span's `TraceDatum` by `TraceSpec.badgeAccessor`
   * (Spec 27), in accessor order. Absent when no accessor is supplied or the span has no badges.
   * The original badge objects are retained **by reference** (never cloned) so interaction events can
   * return the caller's `badge` and its opaque `meta` unchanged. Structurally-empty badges (neither
   * text nor image) are already dropped here; effective text/visibility resolution happens at layout.
   */
  badges?: readonly TraceSpanBadge[];
}
