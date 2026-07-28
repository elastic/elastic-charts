/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TraceCanvasController } from './trace_canvas_controller';
import { resolveTraceAnnotations } from '../data/annotations';
import { resolveSpanBadges } from '../data/badges';
import { TraceDiagnosticsCollector } from '../data/diagnostics';
import { normalize } from '../data/normalize';
import { orderLanes } from '../data/order_lanes';
import { resolveActive } from '../data/self_time';
import type { NormalizedSpan } from '../data/types';
import type { BadgeTextMeasurer } from '../render/badge_layout';
import { computeBadgeGutterWidth } from '../render/badge_layout';
import { buildTraceStyle } from '../theme';
import type { TraceAnnotationSpec, TraceSpec } from '../trace_api';
import { resolveTraceColorBy, traceColorByEqual } from '../trace_api';

/**
 * Returns `buildTraceStyle(theme)`, recomputing only when the theme reference changes.
 * @internal
 */
export function getStyle(c: TraceCanvasController): ReturnType<typeof buildTraceStyle> {
  const { theme } = c.deps.getProps();
  if (!c.styleCache || c.styleCache.theme !== theme) {
    c.styleCache = { theme, style: buildTraceStyle(theme) };
  }
  return c.styleCache.style;
}

/**
 * Memoized normalize→resolveActive→orderLanes pipeline. Recomputed only when data/format/xScaleType
 * (and the other keyed inputs) change — never on a viewport-only frame. Also refreshes the
 * `spanIdToLane` map on invalidation. Stays a pure memoizer: the diagnostics report is part of the
 * cached result and the callback is fired from `frame()`, never from here.
 * @internal
 */
export function getPipeline(c: TraceCanvasController, spec: TraceSpec) {
  const { vizColors } = c.deps.getProps().theme.colors;
  const cache = c.pipelineCache;
  if (
    cache &&
    cache.dataRef === spec.data &&
    cache.xScaleType === spec.xScaleType &&
    cache.traceId === spec.traceId &&
    traceColorByEqual(cache.colorBy, spec.colorBy) &&
    cache.laneOrder === spec.laneOrder &&
    cache.vizColors === vizColors &&
    cache.criticalPath === spec.criticalPath &&
    cache.badgeAccessor === spec.badgeAccessor
  ) {
    return cache.result;
  }

  // One collector rides the pipeline the component already runs, so core trace-data issues and
  // Span-badge issues share a single report (Spec 28).
  const diagnostics = new TraceDiagnosticsCollector();

  // normalize takes TraceDatum[] directly — OTel data arrives pre-converted by fromOtlp.
  const normalizeResult = normalize(
    spec.data,
    spec.xScaleType,
    spec.traceId,
    resolveTraceColorBy(spec.colorBy),
    vizColors,
    spec.criticalPath,
    diagnostics,
  );

  // Derive Span badges from each span's TraceDatum (Spec 27), once per prepared-data change. Runs
  // before resolveActive/orderLanes/collapse, all of which preserve span fields, so badges flow
  // through to geometry and hit testing. Badge issues join the same diagnostics report (Spec 28).
  const withBadges = resolveSpanBadges(normalizeResult.spans, spec.badgeAccessor, diagnostics);

  // Order lanes once here (O(N log N) per data/scale change) so buildGeometry doesn't re-order
  // on every rAF frame. buildGeometry's contract requires pre-ordered input.
  const resolved = resolveActive(withBadges);
  const { lanes: spans, depthBySpan } = orderLanes(resolved, spec.laneOrder ?? 'tree');
  // Derive hasParents and maxDepth from depthBySpan once per pipeline change (not per rAF frame).
  let hasParents = false;
  let maxDepth = 0;
  for (const [, d] of depthBySpan) {
    if (d > 0) hasParents = true;
    if (d > maxDepth) maxDepth = d;
  }
  // Build the report once (pure) and precompute a stable content key for the frame()-side,
  // content-guarded emission. Issue order is first-occurrence, so the key is deterministic.
  const report = diagnostics.report();
  const diagnosticsKey = JSON.stringify(report.issues);
  const result = {
    spans,
    depthBySpan,
    hasParents,
    maxDepth,
    domain: normalizeResult.domain,
    projectionOffset: normalizeResult.projectionOffset,
    emptyReason: normalizeResult.emptyReason,
    criticalIntervals: normalizeResult.criticalIntervals,
    diagnostics: report,
    diagnosticsKey,
  };
  c.pipelineCache = {
    dataRef: spec.data,
    xScaleType: spec.xScaleType,
    traceId: spec.traceId,
    colorBy: spec.colorBy,
    laneOrder: spec.laneOrder,
    vizColors,
    criticalPath: spec.criticalPath,
    badgeAccessor: spec.badgeAccessor,
    result,
  };
  // Rebuild spanIdToLane map on pipeline invalidation (plan D4 — not rebuilt per rAF frame).
  c.spanIdToLane = new Map(spans.map((s, i) => [s.id, i]));
  return result;
}

/**
 * Memoized annotation resolution (Spec 29), keyed on the annotation-spec array ref and the resolved
 * (pre-collapse) spans ref. Structural validation, span/route resolution, and annotation diagnostics
 * happen once per real input change here — never on viewport-only frames.
 * @internal
 */
export function getResolvedAnnotations(
  c: TraceCanvasController,
  annotationSpecs: TraceAnnotationSpec[],
  spans: NormalizedSpan[],
  projectionOffset: number,
) {
  const cache = c.annotationCache;
  if (cache && cache.annotationSpecsRef === annotationSpecs && cache.spansRef === spans) {
    return cache.result;
  }
  const diagnostics = new TraceDiagnosticsCollector();
  const annotations = resolveTraceAnnotations(spans, annotationSpecs, projectionOffset, diagnostics);
  const report = diagnostics.report();
  const diagnosticsKey = JSON.stringify(report.issues);
  const result = { annotations, diagnostics: report, diagnosticsKey };
  c.annotationCache = { annotationSpecsRef: annotationSpecs, spansRef: spans, result };
  return result;
}

/**
 * Memoized badge-only-gutter width (Spec 27). `0` outside `'none'` mode. Recomputed only when the
 * post-collapse spans, badge size, or label position change — the scan touches every span, so it
 * must not run per frame.
 * @internal
 */
export function getBadgeGutterWidth(
  c: TraceCanvasController,
  spans: NormalizedSpan[],
  style: ReturnType<typeof buildTraceStyle>,
  badgeSize: 's' | 'm',
  measure: BadgeTextMeasurer,
): number {
  if (style.labelPosition !== 'none') return 0;
  const cache = c.badgeGutterCache;
  if (
    cache &&
    cache.spansRef === spans &&
    cache.badgeSize === badgeSize &&
    cache.labelPosition === style.labelPosition
  ) {
    return cache.width;
  }
  const width = computeBadgeGutterWidth(spans, style, badgeSize, measure);
  c.badgeGutterCache = { spansRef: spans, badgeSize, labelPosition: style.labelPosition, width };
  return width;
}
