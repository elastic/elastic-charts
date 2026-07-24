/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildColorMap, buildSegmentColorMap } from './colors';
import type { TraceDiagnosticsCollector } from './diagnostics';
import { buildChildrenMap, displayParentId, traceScopedId } from './self_time';
import type { NormalizedSpan } from './types';
import type { Color } from '../../../common/colors';
import { Logger } from '../../../utils/logger';
import type { TraceDatum, TraceColorAccessor, TraceCriticalPath, TraceSpec } from '../trace_api';

type XScaleType = TraceSpec['xScaleType'];

/** @internal */
export interface NormalizeResult {
  spans: NormalizedSpan[];
  domain: { min: number; max: number };
  /** Projected + clamped critical intervals. Re-zeroed in `'linear'` mode; epoch-based in `'time'` mode. */
  criticalIntervals: Array<{ spanId: string; start: number; end: number }>;
  emptyReason?: 'trace-not-found';
}

/**
 * Prepares `TraceDatum[]` for rendering in four stages:
 *
 * 1. **Shape** — maps each `TraceDatum` to a `NormalizedSpan`, ensuring `activeSegments` is always
 *    an array (empty when not supplied; filled by `resolveActive` / ADR 0003) and `meta` always
 *    backrefs the original datum.
 * 2. **Filter** — when `traceId` is supplied, keeps only spans with a matching `traceId` and
 *    dev-warns when nothing matches. When omitted, all spans are rendered as one combined waterfall
 *    and a dev-warn fires if they span more than one distinct trace.
 * 2b. **Recover partial traces** — discloses orphans (missing recorded parent) and assigns them a
 *    synthetic display parent beneath their trace group's elected root, omitting unreachable/invalid
 *    spans (Spec 26 / ADR 0028). Recorded `parentId` and `meta` are never rewritten.
 * 3. **Correct clock skew** — independently places each left-skewed child relative to its corrected
 *    parent using Kibana APM's non-negative propagation-latency heuristic (over display topology).
 * 4. **Project** — computes the domain `[min, max]`. Under `'linear'`, re-zeros `start`/`end`/
 *    `activeSegments` relative to the domain minimum (elapsed ms); under `'time'` keeps epoch ms.
 *
 * For OpenTelemetry data, call `fromOtlp()` first — it converts OTLP spans to `TraceDatum[]` and
 * carries the original `OtelSpan` on `datum.meta`.
 * @internal
 */
export function normalize(
  data: TraceDatum[],
  xScaleType: XScaleType,
  traceId?: string,
  colorBy?: TraceColorAccessor,
  vizColors?: Color[],
  criticalPath: TraceCriticalPath = [],
  diagnostics?: TraceDiagnosticsCollector,
): NormalizeResult {
  // Build color maps over the full input — before traceId filtering — so colors are stable across
  // all traces/views (cross-trace color stability).
  const colorMap =
    colorBy !== undefined && vizColors !== undefined ? buildColorMap(data, colorBy, vizColors) : undefined;
  // Segment label map: same stability rationale as colorMap. Built unconditionally when vizColors is
  // present so segment labels work even without a span-level colorBy accessor.
  const segmentColorMap = vizColors !== undefined ? buildSegmentColorMap(data, vizColors) : undefined;
  const flat = parseSimple(data, colorBy, colorMap, segmentColorMap);
  const selected = selectTrace(flat, traceId);
  // Glossary-precise: trace-not-found means the traceId filter matched nothing, not that all
  // matched spans happened to have non-finite timestamps (dropNonFinite below handles that case).
  const traceNotFound = traceId !== undefined && flat.length > 0 && selected.length === 0;
  const finite = dropNonFinite(selected, diagnostics);
  // Partial-trace recovery: disclose orphans and assign synthetic display parents before clock-skew
  // correction, which traverses display topology (Spec 26 / ADR 0028). May omit unreachable/invalid
  // spans or, for a cross-trace duplicate ID, return no spans (blank mounted plot; emptyReason stays
  // undefined — see ADR 0019 amendment).
  const recovered = recoverPartialTraces(finite, diagnostics);
  const corrected = correctClockSkew(recovered, diagnostics);
  const result = project(corrected, xScaleType, criticalPath, diagnostics);
  if (traceNotFound) result.emptyReason = 'trace-not-found';
  return result;
}

function parseSimple(
  data: TraceDatum[],
  colorBy: TraceColorAccessor | undefined,
  colorMap: Map<string, Color> | undefined,
  segmentColorMap: Map<string, Color> | undefined,
): NormalizedSpan[] {
  return data.map((datum) => {
    const groupKey = colorBy !== undefined ? colorBy(datum) : undefined;
    const groupColor = groupKey !== undefined && colorMap !== undefined ? colorMap.get(groupKey) : undefined;
    return {
      id: datum.id,
      name: datum.name,
      parentId: datum.parentId,
      traceId: datum.traceId,
      start: datum.start,
      end: datum.end,
      activeSegments: datum.activeSegments
        ? datum.activeSegments.map((segment) => {
            // Precedence: explicit segment.color > label-derived palette color.
            // Span-level and themed fallbacks are applied in the renderer via activeFill.
            const resolvedColor =
              segment.color ?? (segment.label !== undefined ? segmentColorMap?.get(segment.label) : undefined);
            return resolvedColor !== undefined ? { ...segment, color: resolvedColor } : { ...segment };
          })
        : [],
      color: datum.color ?? groupColor,
      meta: datum,
    };
  });
}

function selectTrace(spans: NormalizedSpan[], traceId?: string): NormalizedSpan[] {
  if (traceId !== undefined) {
    const kept = spans.filter((span) => span.traceId === traceId);
    if (kept.length === 0 && spans.length > 0) {
      Logger.warn(`Trace chart: traceId "${traceId}" matched no spans; rendering empty.`);
    }
    return kept;
  }
  const distinctTraceIds = new Set(spans.map((span) => span.traceId));
  if (distinctTraceIds.size > 1) {
    Logger.warn(
      `Trace chart received spans from ${distinctTraceIds.size} distinct traces with no traceId set; rendering all as one combined waterfall.`,
    );
  }
  return spans;
}

/**
 * Drops spans whose `start` or `end` is non-finite (NaN / ±Infinity) and warns about the count.
 * Also strips individual `activeSegments` with non-finite bounds from otherwise-valid spans.
 *
 * This is the single choke point that defends both the direct `TraceDatum[]` path and the OTel
 * path (`fromOtlp` → `nanoToMs` → NaN on BigInt parse failure) from poisoning the domain.
 * `Math.min(x, NaN) === NaN`, so a single bad span in `project`'s reduce would blank the entire
 * chart. See otel_adapter.ts comment at L60-62 which promised this filter would exist here.
 *
 * Downstream safety: colorMaps are built over the full pre-filter input (color stability is
 * unaffected), and selection refs are spanId-based (lane reindexing after a drop is correct).
 */
function dropNonFinite(spans: NormalizedSpan[], diagnostics?: TraceDiagnosticsCollector): NormalizedSpan[] {
  const valid: NormalizedSpan[] = [];
  let droppedSpans = 0;
  for (const span of spans) {
    if (!Number.isFinite(span.start) || !Number.isFinite(span.end)) {
      droppedSpans += 1;
      diagnostics?.add('span_non_finite_dropped', 'warning', 'span', span.id);
      continue;
    }
    const finiteSegments = span.activeSegments.filter((seg) => Number.isFinite(seg.start) && Number.isFinite(seg.end));
    if (finiteSegments.length === span.activeSegments.length) {
      valid.push(span);
    } else {
      diagnostics?.add('span_segment_non_finite_dropped', 'warning', 'span', span.id);
      valid.push({ ...span, activeSegments: finiteSegments });
    }
  }

  if (droppedSpans > 0) {
    Logger.warn(
      `Trace chart: dropped ${droppedSpans} span${droppedSpans === 1 ? '' : 's'} with non-finite start/end timestamps (NaN or ±Infinity). Check your data source for failed timestamp conversions.`,
    );
  }
  return valid;
}

/** Human label for a `traceId` group; the `undefined` group is reported as `unknown`. */
function groupLabel(traceId: string | undefined): string {
  return traceId === undefined ? 'unknown' : `"${traceId}"`;
}

/**
 * Partial-trace recovery and orphan reparenting (Spec 26 / ADR 0028). Pure: never mutates a
 * `TraceDatum` or rewrites recorded `parentId`; clones only orphans that receive provenance or a
 * synthetic display parent, and returns the input array reference unchanged for a fully complete
 * input.
 *
 * Runs after `traceId` selection and non-finite filtering. Spans are partitioned by `traceId` (the
 * `undefined` group is one group); parentage is trace-local. Within each group:
 * - a **recorded root** has no `parentId`; an **orphan** has a `parentId` absent from the group;
 * - exactly one recorded root → use it; none + ≥1 orphan → first orphan (input order) is the
 *   `fallbackRoot`; more than one recorded root → elect the last (input order) and omit the rest;
 *   none and no orphan → rootless group, renders no lanes;
 * - genuine orphans are cloned with `orphaned` + `reparentedToSpanId = electedRoot.id`;
 * - a depth-first traversal from the elected root computes the reachable set and detects a duplicate
 *   ID (group-local invalidation → the group contributes no lanes).
 *
 * A span ID occurring in more than one selected `traceId` group invalidates the entire combined
 * result (chart-global IDs). Survivors are materialized in normalized input order (using their clone
 * when one exists); `orderLanes` remains the sole owner of final lane order. Every recovery-driven
 * omission or invalidation is reported through the diagnostics collector (Spec 28); lossless orphan
 * reparenting is reported as an `info` diagnostic rather than staying silent.
 * @internal
 */
export function recoverPartialTraces(
  spans: NormalizedSpan[],
  diagnostics?: TraceDiagnosticsCollector,
): NormalizedSpan[] {
  if (spans.length === 0) return spans;

  // --- Chart-wide pre-scan: a span ID present in more than one selected traceId group is a
  // cross-trace duplicate and invalidates the entire combined result (chart-global span IDs). ---
  const groupsByTraceId = new Map<string | undefined, NormalizedSpan[]>();
  const groupKeysById = new Map<string, Set<string | undefined>>();
  for (const span of spans) {
    let group = groupsByTraceId.get(span.traceId);
    if (!group) {
      group = [];
      groupsByTraceId.set(span.traceId, group);
    }
    group.push(span);
    let keys = groupKeysById.get(span.id);
    if (!keys) {
      keys = new Set();
      groupKeysById.set(span.id, keys);
    }
    keys.add(span.traceId);
  }
  let hasCrossTraceDuplicate = false;
  for (const [id, keys] of groupKeysById) {
    if (keys.size > 1) {
      hasCrossTraceDuplicate = true;
      diagnostics?.add('span_duplicate_id_cross_trace', 'error', 'chart', id);
    }
  }
  if (hasCrossTraceDuplicate) {
    return [];
  }

  // --- Per-group recovery. ---
  const replacement = new Map<NormalizedSpan, NormalizedSpan>(); // original → provenance clone
  const survivors = new Set<NormalizedSpan>(); // original span objects retained
  let changed = false;

  for (const [traceId, groupSpans] of groupsByTraceId) {
    const idSet = new Set(groupSpans.map((s) => s.id));
    const recordedRoots = groupSpans.filter((s) => s.parentId === undefined);
    const orphans = groupSpans.filter((s) => s.parentId !== undefined && !idSet.has(s.parentId));

    let elected: NormalizedSpan;
    let fallback: NormalizedSpan | undefined;
    let orphansToReparent: NormalizedSpan[];

    if (recordedRoots.length === 1) {
      elected = recordedRoots[0]!;
      orphansToReparent = orphans;
    } else if (recordedRoots.length === 0) {
      if (orphans.length === 0) {
        // Rootless (e.g. a rootless cycle): the group renders no lanes.
        diagnostics?.add('trace_group_rootless', 'warning', 'trace', groupLabel(traceId));
        if (groupSpans.length > 0) changed = true;
        continue;
      }
      fallback = orphans[0]!;
      elected = fallback;
      orphansToReparent = orphans.slice(1);
    } else {
      // More than one recorded root: elect the last in normalized input order; the earlier roots
      // and anything reachable only from them are omitted below by reachability (Kibana parity).
      elected = recordedRoots.at(-1)!;
      orphansToReparent = orphans;
    }

    // Clone only spans that receive provenance/synthetic placement.
    const localReplacement = new Map<NormalizedSpan, NormalizedSpan>();
    for (const orphan of orphansToReparent) {
      localReplacement.set(orphan, { ...orphan, orphaned: true, reparentedToSpanId: elected.id });
    }
    if (fallback) {
      localReplacement.set(fallback, { ...fallback, orphaned: true, fallbackRoot: true });
    }

    // DFS the elected root over display topology; detect duplicate IDs within the reachable tree.
    const effective = groupSpans.map((s) => localReplacement.get(s) ?? s);
    const childrenMap = buildChildrenMap(effective, displayParentId);
    const electedEffective = localReplacement.get(elected) ?? elected;
    const reachable = new Set<NormalizedSpan>();
    const visitedIds = new Set<string>();
    let duplicate = false;

    const walk = (node: NormalizedSpan): void => {
      if (reachable.has(node)) return; // cycle guard by object identity
      if (visitedIds.has(node.id)) {
        duplicate = true; // duplicate ID reached within the elected tree
        return;
      }
      visitedIds.add(node.id);
      reachable.add(node);
      for (const child of childrenMap.get(traceScopedId(node.traceId, node.id)) ?? []) {
        walk(child);
      }
    };
    walk(electedEffective);

    if (duplicate) {
      // Group-local invalidation: this group contributes no lanes; other groups still render.
      diagnostics?.add('trace_group_invalidated_duplicate_span_id', 'error', 'trace', groupLabel(traceId));
      if (groupSpans.length > 0) changed = true;
      continue;
    }

    // Retain survivors in normalized input order, using the clone when one exists.
    let survivorCount = 0;
    for (const s of groupSpans) {
      const eff = localReplacement.get(s) ?? s;
      if (reachable.has(eff)) {
        survivors.add(s);
        survivorCount += 1;
        const clone = localReplacement.get(s);
        if (clone) {
          replacement.set(s, clone);
          // Lossless partial-trace recovery: an orphan reparented under the elected root, or the
          // elected fallback root itself (Spec 26). Surfaced as an info diagnostic (Spec 28).
          diagnostics?.add('span_reparented', 'info', 'span', s.id);
        }
      }
    }

    const omitted = groupSpans.length - survivorCount;
    if (omitted > 0) {
      // Count each omitted span; examples identify the affected trace group (Spec 28).
      for (let i = 0; i < omitted; i++) {
        diagnostics?.add('trace_spans_omitted', 'warning', 'trace', groupLabel(traceId));
      }
      changed = true;
    }
    if (localReplacement.size > 0) changed = true; // provenance added
  }

  if (!changed) return spans;

  const result: NormalizedSpan[] = [];
  for (const span of spans) {
    if (!survivors.has(span)) continue;
    result.push(replacement.get(span) ?? span);
  }
  return result;
}

/**
 * Places each valid completed span independently against its corrected parent using Kibana's rule:
 * `latency = Math.max(parentDuration - childDuration, 0) / 2`.
 * Edges involving negative-duration or running spans are ignored.
 * @internal
 */
export function correctClockSkew(
  spans: NormalizedSpan[],
  diagnostics?: TraceDiagnosticsCollector,
): NormalizedSpan[] {
  if (spans.length === 0) return spans;

  const childrenMap = buildChildrenMap(spans, displayParentId);
  const idKeys = new Set(spans.map((span) => traceScopedId(span.traceId, span.id)));
  const roots = spans.filter((span) => {
    const p = displayParentId(span);
    return p === undefined || !idKeys.has(traceScopedId(span.traceId, p));
  });
  const corrected = new Map<NormalizedSpan, NormalizedSpan>();
  const visited = new Set<NormalizedSpan>();
  let correctionTriggered = false;

  for (const span of spans) {
    if (Number.isFinite(span.end) && span.end < span.start) {
      diagnostics?.add('span_negative_duration', 'warning', 'span', span.id);
    }
  }

  function shiftSpan(span: NormalizedSpan, offset: number): NormalizedSpan {
    return {
      ...span,
      start: span.start + offset,
      end: span.end + offset,
      activeSegments: span.activeSegments.map((segment) => ({
        ...segment,
        start: segment.start + offset,
        end: segment.end + offset,
      })),
      skewCorrected: true,
    };
  }

  function dfs(span: NormalizedSpan, parent: NormalizedSpan | null): void {
    if (visited.has(span)) return;
    visited.add(span);

    const canCorrect =
      parent !== null &&
      Number.isFinite(span.end) &&
      Number.isFinite(parent.end) &&
      span.end >= span.start &&
      parent.end >= parent.start &&
      span.start < parent.start;

    let current = span;
    if (canCorrect) {
      const parentDuration = parent.end - parent.start;
      const childDuration = span.end - span.start;
      const latency = Math.max(parentDuration - childDuration, 0) / 2;
      const offset = parent.start + latency - span.start;
      current = shiftSpan(span, offset);
      correctionTriggered = true;
      diagnostics?.add('span_clock_skew_corrected', 'info', 'span', span.id);
    }

    corrected.set(span, current);
    for (const child of childrenMap.get(traceScopedId(span.traceId, span.id)) ?? []) {
      dfs(child, current);
    }
  }

  roots.forEach((root) => dfs(root, null));

  if (!correctionTriggered) return spans;
  return spans.map((span) => corrected.get(span) ?? span);
}

function project(
  spans: NormalizedSpan[],
  xScaleType: XScaleType,
  criticalPath: TraceCriticalPath,
  diagnostics?: TraceDiagnosticsCollector,
): NormalizeResult {
  if (spans.length === 0) {
    return { spans: [], domain: { min: 0, max: 0 }, criticalIntervals: [] };
  }
  const min = spans.reduce((acc, span) => Math.min(acc, span.start), Infinity);
  const max = spans.reduce((acc, span) => Math.max(acc, span.end), -Infinity);

  if (xScaleType === 'time') {
    // Time mode: no re-zero; clamp each interval to its span's [start, end] and drop invalids.
    const spanById = new Map(spans.map((s) => [s.id, s]));
    const criticalIntervals = projectCriticalIntervals(criticalPath, spanById, 0, diagnostics);
    return { spans, domain: { min, max }, criticalIntervals };
  }

  const rezeroed = spans.map((span) => ({
    ...span,
    start: span.start - min,
    end: span.end - min,
    activeSegments: span.activeSegments.map((segment) => ({
      ...segment,
      start: segment.start - min,
      end: segment.end - min,
    })),
  }));
  // Linear mode: re-zero intervals by the same `min`, then clamp to the projected span extent.
  const spanById = new Map(rezeroed.map((s) => [s.id, s]));
  const criticalIntervals = projectCriticalIntervals(criticalPath, spanById, min, diagnostics);
  return { spans: rezeroed, domain: { min: 0, max: max - min }, criticalIntervals };
}

/**
 * Projects raw `TraceCriticalPath` intervals into the post-projection coordinate space.
 *
 * - Re-zeros by `offset` (`domainMin` in `'linear'` mode; `0` in `'time'` mode so no shift).
 * - Clamps each interval to its span's projected `[start, end]` (whole-span, not just active
 *   segments — an interval may fall in a waiting region; see ADR 0015 Decision 3 and CONTEXT.md).
 * - Drops: unknown `spanId` (reported as `reference_unresolved_span`); `start >= end` after clamping.
 * @internal
 */
function projectCriticalIntervals(
  criticalPath: TraceCriticalPath,
  spanById: ReadonlyMap<string, NormalizedSpan>,
  projectionOffset: number,
  diagnostics?: TraceDiagnosticsCollector,
): Array<{ spanId: string; start: number; end: number }> {
  const result: Array<{ spanId: string; start: number; end: number }> = [];
  for (const { spanId, start: rawStart, end: rawEnd } of criticalPath) {
    const span = spanById.get(spanId);
    if (span === undefined) {
      diagnostics?.add('reference_unresolved_span', 'warning', 'reference', `criticalPath/${spanId}`);
      continue; // unknown spanId — drop
    }
    const skewOffset = span.skewCorrected ? span.start + projectionOffset - span.meta.start : 0;
    const start = Math.max(rawStart + skewOffset - projectionOffset, span.start);
    const end = Math.min(rawEnd + skewOffset - projectionOffset, span.end);
    if (start >= end) continue; // fully outside or zero-width after clamp — drop
    result.push({ spanId, start, end });
  }
  return result;
}
