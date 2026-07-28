/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Wheel zoom velocity: maps normalized wheel distance (deltaY/plotWidth) to zoom change.
 * Same order of magnitude as Timeslip's wheel handler.
 */
export const WHEEL_ZOOM_VELOCITY = 3;

/** Debounce window for single-vs-double click disambiguation (ADR 0011 Decision 6). */
export const DBLCLICK_DEBOUNCE_MS = 250;

/** Movement tolerance in CSS px before a 1-finger touch is reclassified as a drag (ADR 0021 D6). */
export const TAP_MOVE_TOLERANCE_PX = 10;

/** Duration in ms a stationary finger must be held before triggering a long-press pin (ADR 0021 D6). */
export const LONG_PRESS_MS = 500;

/**
 * Keyboard pan fraction: one ←/→ keypress pans the visible time window by this fraction of its
 * current extent. 1:1 snap (easeZoom=false) per ADR 0004 Decision 2 — domainTween cannot ease pan.
 */
export const KEY_PAN_FRACTION = 0.1;

/**
 * Keyboard zoom step: one +/- keypress applies this zoomChange (same sign/magnitude convention as
 * the wheel handler). Positive = zoom in. Eased via domainTween (easeZoom=true) like wheel zoom.
 */
export const KEY_ZOOM_STEP = 0.5;

/**
 * Echo-suppression threshold for focusDomain change detection. Mirrors TWEEN_DONE_EPSILON from
 * `timeslip/projections/domain_tween.ts:13` — scale-invariant extent-ratio. Used for both the
 * extent-ratio and the focus-extent-relative position check (ADR 0007 §Echo-suppression).
 */
export const FOCUS_DOMAIN_EPSILON = 0.001;

/**
 * Stable no-op for BasicTooltip callback props that trace manages internally, and the identity
 * fallback for `Settings.onElement*` handlers. `mapStateToProps` falls back to this exact reference
 * so `connect` sees stable props on unrelated redux churn and `elementClickIsInteractive()` can
 * identity-compare against it. It MUST be shared between the component and the controller.
 */
export const NOOP = () => {};

/** Stable empty array for BasicTooltip `selected` prop (trace has no tooltip item selection). */
export const EMPTY: never[] = [];

/** Order-insensitive equality for two `Set<string>` collapse states. */
export function collapseSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}
