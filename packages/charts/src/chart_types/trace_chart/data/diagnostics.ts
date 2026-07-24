/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Structured Trace data diagnostics (Spec 28). Charts computes a {@link TraceDataDiagnostics} report
 * from the same prepared trace data that drives visible output, tooltip metadata, screen-reader rows,
 * and interaction metadata, and hands it to `TraceSpec.onDataDiagnosticsChange`. The report explains
 * malformed, corrected, omitted, or invalid trace input without applications scraping developer logs.
 *
 * Everything here is machine-readable only: no localized/user-facing prose. Applications own
 * user-visible copy, grouping, and remediation text.
 */

/**
 * Severity of one diagnostic issue: `info` for successful corrections/recoveries, `warning` for
 * recoverable omissions or degraded semantics, `error` for issues that invalidate a trace group or
 * the selected combined result (Spec 28).
 * @public
 */
export type TraceDataDiagnosticSeverity = 'info' | 'warning' | 'error';

/**
 * The level a diagnostic issue affects, so consumers need not decode the issue kind (Spec 28).
 * `'annotation'` covers Trace annotations (Spec 29) and `'reference'` covers other caller-supplied
 * references such as critical-path intervals or connections.
 * @public
 */
export type TraceDataDiagnosticScope = 'chart' | 'trace' | 'span' | 'badge' | 'annotation' | 'reference';

/**
 * Closed union of supported diagnostic issue kinds (Spec 28 / Spec 29). New kinds may be added
 * deliberately as the Trace diagnostics surface expands, but arbitrary string kinds are not accepted.
 * Connection kinds are intentionally deferred until that feature lands.
 * @public
 */
export type TraceDataDiagnosticKind =
  // --- Trace topology / duplicate ids -----------------------------------------------------------
  /** The same span id appeared in more than one selected trace group; the whole combined result is invalidated. */
  | 'span_duplicate_id_cross_trace'
  /** A duplicate span id was reached within one elected trace tree; that trace group contributes no lanes. */
  | 'trace_group_invalidated_duplicate_span_id'
  /** A trace group has no elected root (rootless / disconnected / a rootless cycle) and renders no lanes. */
  | 'trace_group_rootless'
  /** Spans were omitted as unreachable from the elected root (includes earlier-root omission from root election). */
  | 'trace_spans_omitted'
  // --- Partial-trace recovery (Spec 26) ---------------------------------------------------------
  /** An orphan was given a synthetic display parent or elected as the fallback root (a recovery). */
  | 'span_reparented'
  // --- Clock skew (Spec 22 / ADR 0022) ----------------------------------------------------------
  /** A span's timings were shifted to correct detected clock skew. */
  | 'span_clock_skew_corrected'
  /** A negative-duration span was left uncorrected (clock-skew correction ignored for it). */
  | 'span_negative_duration'
  // --- Non-finite input -------------------------------------------------------------------------
  /** A span was dropped because its `start`/`end` was non-finite (NaN or ±Infinity). */
  | 'span_non_finite_dropped'
  /** One or more active segments with non-finite bounds were stripped from an otherwise-valid span. */
  | 'span_segment_non_finite_dropped'
  // --- Caller-supplied references ---------------------------------------------------------------
  /** A critical-path interval referenced a span id that is not present in the prepared data. */
  | 'reference_unresolved_span'
  // --- Span badges (Spec 27) --------------------------------------------------------------------
  /** One span returned multiple badges with the same `id` (Spec 27). */
  | 'badge_duplicate_id'
  /** A badge had neither text nor image (whitespace-only text counts as absent). */
  | 'badge_empty'
  /** A badge's `text` was present but not a string. */
  | 'badge_non_string_text'
  /** A badge's `visibleIn` contained values outside the Label-position set. */
  | 'badge_invalid_visibility'
  /** An image-only badge had no `ariaLabel`; it still renders with a generated name. */
  | 'badge_missing_aria_label'
  // --- Trace annotations (Spec 29) --------------------------------------------------------------
  /** More than one Trace annotation child spec shared the same `id`. */
  | 'annotation_duplicate_id'
  /** A time annotation had an invalid position: non-finite value, both `time` and `range`, or an empty/reversed range. */
  | 'annotation_invalid_time'
  /** A lane/hierarchy annotation referenced a span id not present in the prepared data; it is omitted. */
  | 'annotation_unresolved_span'
  /** An annotation had no accessible name; it still renders with a generic generated name. */
  | 'annotation_missing_aria_label';

/**
 * One aggregated diagnostic issue: a kind + severity + scope, the total occurrence `count`, and a
 * bounded, stable list of `examples`. Not an exhaustive occurrence list (Spec 28).
 * @public
 */
export interface TraceDataDiagnosticIssue {
  kind: TraceDataDiagnosticKind;
  severity: TraceDataDiagnosticSeverity;
  scope: TraceDataDiagnosticScope;
  /** Total occurrences observed, independent of how many were retained as `examples`. */
  count: number;
  /** Bounded, insertion-ordered, de-duplicated example identities (e.g. `spanId/badgeId`). */
  examples: string[];
}

/**
 * Structured report describing trace data issues found while preparing visible Trace output.
 * `issues` is the canonical, flat diagnostics surface: each entry carries a kind, severity, scope,
 * total `count`, and bounded stable `examples`. There are no kind-specific top-level buckets so new
 * kinds can be added without expanding the public shape sideways (Spec 28). A derived summary is not
 * exposed in v1 — consumers derive counts from `issues` when needed.
 * @public
 */
export interface TraceDataDiagnostics {
  issues: TraceDataDiagnosticIssue[];
}

/**
 * Library-defined cap on retained examples per issue. Not public configuration (Spec 28): large
 * malformed input still reports an accurate `count` but a bounded `examples` list.
 * @internal
 */
export const DIAGNOSTICS_EXAMPLE_CAP = 5;

/**
 * Accumulates diagnostic issues during trace-data preparation, aggregating by `(kind, scope,
 * severity)` and bounding the retained examples. Order of first occurrence is preserved so the
 * emitted report is stable for identical input.
 * @internal
 */
export class TraceDiagnosticsCollector {
  private readonly issues = new Map<string, TraceDataDiagnosticIssue>();
  private readonly seenExamples = new Map<string, Set<string>>();

  /**
   * Records one occurrence of `kind`. `example` is an optional stable identity (retained up to
   * {@link DIAGNOSTICS_EXAMPLE_CAP}, de-duplicated); the total `count` always increments.
   */
  add(
    kind: TraceDataDiagnosticKind,
    severity: TraceDataDiagnosticSeverity,
    scope: TraceDataDiagnosticScope,
    example?: string,
  ): void {
    const key = `${kind}|${scope}|${severity}`;
    let issue = this.issues.get(key);
    if (issue === undefined) {
      issue = { kind, severity, scope, count: 0, examples: [] };
      this.issues.set(key, issue);
      this.seenExamples.set(key, new Set());
    }
    issue.count += 1;
    if (example !== undefined) {
      const seen = this.seenExamples.get(key)!;
      if (!seen.has(example)) {
        seen.add(example);
        if (issue.examples.length < DIAGNOSTICS_EXAMPLE_CAP) issue.examples.push(example);
      }
    }
  }

  /** True when no issue has been recorded. */
  isEmpty(): boolean {
    return this.issues.size === 0;
  }

  /** The canonical flat issue list, in first-occurrence order. */
  list(): TraceDataDiagnosticIssue[] {
    return [...this.issues.values()];
  }

  /** The public {@link TraceDataDiagnostics} report. Issues-only in v1 (no derived summary). */
  report(): TraceDataDiagnostics {
    return { issues: this.list() };
  }
}
