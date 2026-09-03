/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 13.1 — Unit tests for selection_helpers.ts.
 *
 * Pure function tests: no component mounting, no JSDOM canvas constraints.
 * Covers:
 *   - refsEqual / selectionSetEqual
 *   - selectionModeFromEvent (G2 seam: both Apple and non-Apple platforms)
 *   - applySelection: replace / additive / toggle semantics
 */

import { applySelection, refsEqual, selectionModeFromEvent, selectionSetEqual } from './selection_helpers';
import type { TraceSegmentRef } from './trace_api';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const refA: TraceSegmentRef = { spanId: 'span-a', region: 'active', segmentIndex: 0 };
const refA2: TraceSegmentRef = { spanId: 'span-a', region: 'active', segmentIndex: 0 }; // same identity, different object
const refB: TraceSegmentRef = { spanId: 'span-b', region: 'active', segmentIndex: 1 };
const refC: TraceSegmentRef = { spanId: 'span-a', region: 'waiting', segmentIndex: 0 }; // same span, different region

/** Build a minimal KeyboardEvent-like object with only the modifier flags. */
function makeKbEvent(opts: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }): KeyboardEvent {
  return {
    metaKey: opts.metaKey ?? false,
    ctrlKey: opts.ctrlKey ?? false,
    shiftKey: opts.shiftKey ?? false,
  } as unknown as KeyboardEvent;
}

// ---------------------------------------------------------------------------
// refsEqual
// ---------------------------------------------------------------------------

describe('refsEqual', () => {
  it('returns true for structurally equal refs (different objects)', () => {
    expect(refsEqual(refA, refA2)).toBe(true);
  });

  it('returns false when spanId differs', () => {
    expect(refsEqual(refA, refB)).toBe(false);
  });

  it('returns false when region differs (same span)', () => {
    expect(refsEqual(refA, refC)).toBe(false);
  });

  it('returns false when segmentIndex differs', () => {
    const refDiff: TraceSegmentRef = { spanId: 'span-a', region: 'active', segmentIndex: 1 };
    expect(refsEqual(refA, refDiff)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// selectionSetEqual
// ---------------------------------------------------------------------------

describe('selectionSetEqual', () => {
  it('returns true for empty sets', () => {
    expect(selectionSetEqual([], [])).toBe(true);
  });

  it('returns false when sizes differ', () => {
    expect(selectionSetEqual([refA], [refA, refB])).toBe(false);
  });

  it('returns true for sets with same members in different order', () => {
    expect(selectionSetEqual([refA, refB], [refB, refA])).toBe(true);
  });

  it('returns false when sets have same size but different members', () => {
    expect(selectionSetEqual([refA, refB], [refA, refC])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// selectionModeFromEvent — G2 seam table test (both platforms × all modifier combos)
// ---------------------------------------------------------------------------

describe('selectionModeFromEvent', () => {
  describe('non-Apple platform (isApple=false)', () => {
    it('no modifier → replace', () => {
      expect(selectionModeFromEvent(makeKbEvent({}), false)).toBe('replace');
    });

    it('shiftKey only → additive', () => {
      expect(selectionModeFromEvent(makeKbEvent({ shiftKey: true }), false)).toBe('additive');
    });

    it('ctrlKey only → toggle', () => {
      expect(selectionModeFromEvent(makeKbEvent({ ctrlKey: true }), false)).toBe('toggle');
    });

    it('metaKey only → replace (metaKey is Cmd on Mac, ignored on non-Apple)', () => {
      expect(selectionModeFromEvent(makeKbEvent({ metaKey: true }), false)).toBe('replace');
    });

    it('ctrlKey + shiftKey → toggle (toggle wins over additive)', () => {
      expect(selectionModeFromEvent(makeKbEvent({ ctrlKey: true, shiftKey: true }), false)).toBe('toggle');
    });
  });

  describe('Apple platform (isApple=true)', () => {
    it('no modifier → replace', () => {
      expect(selectionModeFromEvent(makeKbEvent({}), true)).toBe('replace');
    });

    it('shiftKey only → additive', () => {
      expect(selectionModeFromEvent(makeKbEvent({ shiftKey: true }), true)).toBe('additive');
    });

    it('metaKey only → toggle (Cmd on Mac)', () => {
      expect(selectionModeFromEvent(makeKbEvent({ metaKey: true }), true)).toBe('toggle');
    });

    it('ctrlKey only → replace (Ctrl+click fires contextmenu on Mac, not used for selection)', () => {
      expect(selectionModeFromEvent(makeKbEvent({ ctrlKey: true }), true)).toBe('replace');
    });

    it('metaKey + shiftKey → toggle (toggle wins over additive)', () => {
      expect(selectionModeFromEvent(makeKbEvent({ metaKey: true, shiftKey: true }), true)).toBe('toggle');
    });
  });
});

// ---------------------------------------------------------------------------
// applySelection
// ---------------------------------------------------------------------------

describe('applySelection — replace mode', () => {
  it('replaces an empty selection with the ref', () => {
    expect(applySelection([], refA, 'replace')).toEqual([refA]);
  });

  it('replaces a non-empty selection with just the ref', () => {
    expect(applySelection([refA, refB], refC, 'replace')).toEqual([refC]);
  });

  it('replace is idempotent when ref is already the only entry', () => {
    expect(applySelection([refA], refA2, 'replace')).toEqual([refA2]);
  });
});

describe('applySelection — additive mode', () => {
  it('adds the ref when the set is empty', () => {
    const result = applySelection([], refA, 'additive');
    expect(result).toHaveLength(1);
    expect(refsEqual(result[0]!, refA)).toBe(true);
  });

  it('adds the ref when it is not in the set', () => {
    const result = applySelection([refA], refB, 'additive');
    expect(result).toHaveLength(2);
  });

  it('is a no-op (never removes) when the ref is already in the set', () => {
    const current = [refA, refB];
    const result = applySelection(current, refA2, 'additive');
    // Same length — ref was not added again, not removed
    expect(result).toHaveLength(2);
    // additive no-op returns the same array reference (no new allocation needed)
    expect(result).toBe(current);
  });

  it('Shift-clicking already-selected ref leaves the count unchanged', () => {
    const before = [refA, refB];
    const after = applySelection(before, refA, 'additive');
    expect(after.length).toBe(before.length);
  });
});

describe('applySelection — toggle mode', () => {
  it('adds the ref when absent', () => {
    const result = applySelection([refA], refB, 'toggle');
    expect(result).toHaveLength(2);
  });

  it('removes the ref when present', () => {
    const result = applySelection([refA, refB], refA, 'toggle');
    expect(result).toHaveLength(1);
    expect(refsEqual(result[0]!, refB)).toBe(true);
  });

  it('removes the correct ref by identity (not by position)', () => {
    const result = applySelection([refA, refB, refC], refB, 'toggle');
    expect(result).toHaveLength(2);
    expect(result.some((r) => refsEqual(r, refB))).toBe(false);
    expect(result.some((r) => refsEqual(r, refA))).toBe(true);
    expect(result.some((r) => refsEqual(r, refC))).toBe(true);
  });

  it('toggles an empty set to [ref]', () => {
    expect(applySelection([], refA, 'toggle')).toEqual([refA]);
  });
});
