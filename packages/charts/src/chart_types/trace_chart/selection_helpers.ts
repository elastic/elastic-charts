/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Pure helper functions for segment-selection math (ADR 0011 §13.1).
 *
 * Extracted from trace_chart.tsx so they can be unit-tested independently
 * of the JSDOM / RAF / canvas constraints that prevent full component tests.
 */

import type { TraceSegmentRef, TraceSelection } from './trace_api';

// ---------------------------------------------------------------------------
// Ref equality
// ---------------------------------------------------------------------------

/** Deep-equal comparison for two TraceSegmentRef values. */
export function refsEqual(a: TraceSegmentRef, b: TraceSegmentRef): boolean {
  return a.spanId === b.spanId && a.region === b.region && a.segmentIndex === b.segmentIndex;
}

/** Order-insensitive set equality for TraceSelection (ADR 0011 / plan D1). */
export function selectionSetEqual(a: TraceSelection, b: TraceSelection): boolean {
  if (a.length !== b.length) return false;
  return a.every((refA) => b.some((refB) => refsEqual(refA, refB)));
}

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

/**
 * True when running on an Apple device (macOS / iOS).
 * Mirrors src/components/legend/label.tsx — no shared util exists; a local const matches the pattern.
 * Used to normalise Cmd (Mac) ↔ Ctrl (other) for the toggle modifier: macOS Ctrl+click fires
 * `contextmenu` (the tooltip-pin handler), so we must use metaKey there instead.
 */
export const isAppleDevice = typeof window !== 'undefined' && /Mac|iPhone|iPad/.test(window.navigator.userAgent);

// ---------------------------------------------------------------------------
// Selection mode
// ---------------------------------------------------------------------------

export type SelectionMode = 'replace' | 'additive' | 'toggle';

/**
 * Maps a mouse/keyboard event to a SelectionMode using the native desktop convention:
 *
 *   Cmd (Mac) / Ctrl (other) → toggle   (toggle wins when both held with Shift)
 *   Shift                    → additive  (add only; never removes)
 *   neither                  → replace
 *
 * The optional `isApple` parameter defaults to the module-level `isAppleDevice` const.
 * Tests pass `true`/`false` to table-test both platforms without global UA mocking
 * (ADR 0011 §13.1 G2 seam).
 */
export function selectionModeFromEvent(e: MouseEvent | KeyboardEvent, isApple = isAppleDevice): SelectionMode {
  if (isApple ? e.metaKey : e.ctrlKey) return 'toggle'; // toggle wins when both held
  if (e.shiftKey) return 'additive';
  return 'replace';
}

// ---------------------------------------------------------------------------
// Apply selection
// ---------------------------------------------------------------------------

/**
 * Apply a selection operation against the current set, returning the new set.
 *
 *   replace  → [ref]  (always replaces, regardless of membership)
 *   additive → adds ref if absent; no-op if already present (never removes)
 *   toggle   → removes ref if present; adds if absent
 */
export function applySelection(current: TraceSelection, ref: TraceSegmentRef, mode: SelectionMode): TraceSelection {
  const existingIdx = current.findIndex((r) => refsEqual(r, ref));
  if (mode === 'replace') return [ref];
  if (mode === 'additive') return existingIdx >= 0 ? current : [...current, ref];
  // toggle
  return existingIdx >= 0 ? current.filter((_, i) => i !== existingIdx) : [...current, ref];
}
