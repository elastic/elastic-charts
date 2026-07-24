/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TraceDiagnosticsCollector } from './diagnostics';
import { displayParentId } from './self_time';
import type { NormalizedSpan } from './types';
import type {
  TraceAnnotationColor,
  TraceAnnotationDatum,
  TraceAnnotationSpec,
  TraceAnnotationType,
  TraceTimeAnnotationPlacement,
  TraceTimeAnnotationSpec,
} from '../trace_api';

/** Shared resolved fields for every annotation kind. @internal */
export interface ResolvedTraceAnnotationBase {
  id: string;
  kind: TraceAnnotationType;
  /** Public datum reported in interaction events (`meta` by reference; author-supplied `ariaLabel`). */
  datum: TraceAnnotationDatum;
  /** Resolved accessible name — the author's `ariaLabel`, or a generated fallback when absent. */
  ariaLabel: string;
  color?: TraceAnnotationColor;
}

/** A resolved time annotation. Positions are projected (re-zeroed); authored values feed events. @internal */
export interface ResolvedTimeAnnotation extends ResolvedTraceAnnotationBase {
  kind: 'time';
  /** Anchor placement (Spec 29). `'timebar'` marker + guide, or `'plot'` full-height rail. */
  placement: TraceTimeAnnotationPlacement;
  /** Projected single position, for a point annotation. */
  time?: number;
  /** Projected `[from, to]`, for a range annotation. */
  range?: [number, number];
  /** The author-supplied (pre-projection) position, reported unchanged in events. */
  authoredTime?: number;
  authoredRange?: [number, number];
}

/** A resolved lane/hierarchy annotation, anchored to a prepared span. @internal */
export interface ResolvedSpanAnnotation extends ResolvedTraceAnnotationBase {
  kind: 'lane' | 'hierarchy';
  spanId: string;
  /** Route span ids root→target (hierarchy) or the single `[target]` (lane). */
  routeSpanIds: string[];
  /** The resolved target span — source of the related-span metadata reported in events. */
  span: NormalizedSpan;
}

/** @internal */
export type ResolvedTraceAnnotation = ResolvedTimeAnnotation | ResolvedSpanAnnotation;

/**
 * Resolves composed Trace annotation child specs against the prepared (ordered, pre-collapse) span
 * output (Spec 29). Structural validation and span/route resolution happen here — the diagnostics
 * side channel; per-frame domain culling, viewport clipping, and collapse omission happen later at
 * layout and are never diagnostics. Hidden annotations are skipped entirely. Author references
 * (`meta`) are returned by reference; spans are never mutated.
 *
 * `projectionOffset` matches {@link import('./normalize').NormalizeResult.projectionOffset} so a
 * time annotation's caller-supplied `time`/`range` re-zero exactly like critical-path intervals.
 * @internal
 */
export function resolveTraceAnnotations(
  spans: NormalizedSpan[],
  annotationSpecs: readonly TraceAnnotationSpec[],
  projectionOffset: number,
  diagnostics?: TraceDiagnosticsCollector,
): ResolvedTraceAnnotation[] {
  if (annotationSpecs.length === 0) return [];

  const spanById = new Map(spans.map((s) => [s.id, s]));
  const seenIds = new Set<string>();
  const resolved: ResolvedTraceAnnotation[] = [];

  for (const spec of annotationSpecs) {
    if (spec.hidden) continue;

    // Duplicate id detection runs before structural validation so a duplicate is reported even when
    // the offending annotation is later dropped for an invalid position or unresolved span.
    if (seenIds.has(spec.id)) {
      diagnostics?.add('annotation_duplicate_id', 'warning', 'annotation', spec.id);
    } else {
      seenIds.add(spec.id);
    }

    const datum: TraceAnnotationDatum = {
      id: spec.id,
      hidden: spec.hidden,
      color: spec.color,
      ariaLabel: spec.ariaLabel,
      meta: spec.meta,
    };

    if (spec.annotationKind === 'time') {
      const position = resolveTimePosition(spec, projectionOffset, diagnostics);
      if (position === null) continue;
      resolved.push({
        id: spec.id,
        kind: 'time',
        placement: spec.placement ?? 'timebar',
        datum,
        color: spec.color,
        ariaLabel: resolveAnnotationAriaLabel(spec, diagnostics),
        ...position,
      });
      continue;
    }

    const span = spanById.get(spec.spanId);
    if (span === undefined) {
      diagnostics?.add('annotation_unresolved_span', 'warning', 'annotation', `${spec.annotationKind}/${spec.spanId}`);
      continue;
    }
    resolved.push({
      id: spec.id,
      kind: spec.annotationKind,
      datum,
      color: spec.color,
      ariaLabel: resolveAnnotationAriaLabel(spec, diagnostics),
      spanId: spec.spanId,
      routeSpanIds: spec.annotationKind === 'hierarchy' ? resolveRoute(span, spanById) : [span.id],
      span,
    });
  }

  return resolved;
}

/**
 * Validates a time annotation's position and projects it. Returns `null` (and reports
 * `annotation_invalid_time`) when it supplies neither or both of `time`/`range`, a non-finite value,
 * or an empty/reversed range.
 */
function resolveTimePosition(
  spec: TraceTimeAnnotationSpec,
  projectionOffset: number,
  diagnostics?: TraceDiagnosticsCollector,
): Pick<ResolvedTimeAnnotation, 'time' | 'range' | 'authoredTime' | 'authoredRange'> | null {
  const hasTime = spec.time !== undefined;
  const hasRange = spec.range !== undefined;
  if (hasTime === hasRange) {
    // Neither supplied, or both supplied (the public props union forbids both at author time).
    diagnostics?.add('annotation_invalid_time', 'warning', 'annotation', spec.id);
    return null;
  }
  if (hasTime) {
    const t = spec.time as number;
    if (!Number.isFinite(t)) {
      diagnostics?.add('annotation_invalid_time', 'warning', 'annotation', spec.id);
      return null;
    }
    return { time: t - projectionOffset, authoredTime: t };
  }
  const [from, to] = spec.range as [number, number];
  if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to) {
    diagnostics?.add('annotation_invalid_time', 'warning', 'annotation', spec.id);
    return null;
  }
  return { range: [from - projectionOffset, to - projectionOffset], authoredRange: [from, to] };
}

/**
 * Resolves the visible ancestry route root→target through the display hierarchy (recorded parentage
 * plus any synthetic reparenting reflected in visible output, via {@link displayParentId}). A cycle
 * or a parent absent from the prepared data terminates the walk.
 */
function resolveRoute(target: NormalizedSpan, spanById: ReadonlyMap<string, NormalizedSpan>): string[] {
  const route: string[] = [target.id];
  const visited = new Set<string>([target.id]);
  let current = target;
  for (;;) {
    const parentId = displayParentId(current);
    if (parentId === undefined) break;
    const parent = spanById.get(parentId);
    if (parent === undefined || visited.has(parent.id)) break;
    visited.add(parent.id);
    route.push(parent.id);
    current = parent;
  }
  return route.reverse();
}

/**
 * The annotation's accessible name: the author's non-blank `ariaLabel`, or a generic generated name.
 * A missing name is reported (`annotation_missing_aria_label`) but the annotation still renders.
 */
function resolveAnnotationAriaLabel(spec: TraceAnnotationSpec, diagnostics?: TraceDiagnosticsCollector): string {
  if (typeof spec.ariaLabel === 'string' && spec.ariaLabel.trim().length > 0) return spec.ariaLabel;
  diagnostics?.add('annotation_missing_aria_label', 'warning', 'annotation', spec.id);
  return `Trace annotation ${spec.id}`;
}
