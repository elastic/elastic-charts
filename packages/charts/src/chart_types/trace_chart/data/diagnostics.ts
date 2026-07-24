/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Structured Trace data diagnostics (Spec 28), scoped in this phase to the Span badge issues raised
 * during data preparation (Spec 27). The public report surface (`TraceDataDiagnostics`,
 * `TraceSpec.onDataDiagnosticsChange`, and the core trace-data kinds) is intentionally **not exposed
 * yet** — these types stay `@internal` so the eventual Spec 28 phase can promote and extend them
 * without a breaking rename. Everything here is machine-readable only: no localized/user-facing prose.
 */

/**
 * Severity of one diagnostic issue: `info` for successful corrections/recoveries, `warning` for
 * recoverable omissions or degraded semantics, `error` for issues that invalidate a trace group or
 * the selected combined result (Spec 28).
 * @internal
 */
export type TraceDataDiagnosticSeverity = 'info' | 'warning' | 'error';

/**
 * The level a diagnostic issue affects, so consumers need not decode the issue kind (Spec 28).
 * @internal
 */
export type TraceDataDiagnosticScope = 'chart' | 'trace' | 'span' | 'badge' | 'annotation' | 'reference';

/**
 * Closed union of supported diagnostic issue kinds. Only the Span badge kinds exist in this phase;
 * the core trace-data kinds (clock skew, omitted/invalid groups, duplicate span ids, unresolved
 * references, …) are added when Spec 28's public report lands. Arbitrary string kinds are not
 * accepted.
 * @internal
 */
export type TraceDataDiagnosticKind =
  /** One span returned multiple badges with the same `id` (Spec 27). */
  | 'badge_duplicate_id'
  /** A badge had neither text nor image (whitespace-only text counts as absent). */
  | 'badge_empty'
  /** A badge's `text` was present but not a string. */
  | 'badge_non_string_text'
  /** A badge's `visibleIn` contained values outside the Label-position set. */
  | 'badge_invalid_visibility'
  /** An image-only badge had no `ariaLabel`; it still renders with a generated name. */
  | 'badge_missing_aria_label';

/**
 * One aggregated diagnostic issue: a kind + severity + scope, the total occurrence `count`, and a
 * bounded, stable list of `examples`. Not an exhaustive occurrence list (Spec 28).
 * @internal
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
}
