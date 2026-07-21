/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HoverRegion, TraceGeometry } from './render/types';
import type { TooltipInfo } from '../../components/tooltip/types';
import type { Multitouch } from '../timeslip/utils/multitouch';

/**
 * Hover and drag state for the canvas pointer. `lastGeom` is written once per frame and read by
 * all mouse/click handlers for picking — single source of truth for the current layout.
 * `index` is −1 when no span is hovered (matches pickLane/pickRegion sentinel).
 */
export interface HoverState {
  lastGeom: TraceGeometry | null;
  index: number;
  region: HoverRegion | null;
  pointerX: number;
  pointerY: number;
  tooltipInfo: TooltipInfo;
  /** True while a pan-drag is in progress; suppresses the post-drag click. */
  dragMoved: boolean;
}

/**
 * Pin (sticky tooltip) state. `pinned=true` freezes `updateHover` so the content and index stay
 * as-is while the pointer moves elsewhere or zoom/pan runs.
 */
export interface PinState {
  pinned: boolean;
  x: number;
  y: number;
}

/**
 * Touch gesture state (Spec 23 / ADR 0021). Tracks the current gesture so touchmove and touchend
 * can resolve pinch vs pan vs tap vs long-press correctly.
 * `longPressTimer` is a plain instance field on TraceComponent (not here) — it doesn't affect the
 * gesture classification, only needs cancellation.
 */
export interface TouchState {
  /** Previous frame's sorted touch positions; input to pinchRatio on each touchmove. */
  multitouch: Multitouch;
  /** 1-finger gesture origin for hit-testing. null = inert (pinned-dismiss, ≥3-finger, etc.). */
  tapStart: { x: number; y: number } | null;
  /** True once movement exceeded TAP_MOVE_TOLERANCE_PX — gesture is a drag, not a tap. */
  moved: boolean;
  /** True once the long-press timer fired — suppress the release-tap that follows. */
  longPressFired: boolean;
}

/**
 * Brush-to-zoom state (Spec 11). `active` gates the window drag handlers so a brush gesture never
 * also pans. `end` tracks the last clamped x so mouseup has it even if the pointer released
 * outside the canvas. `overlay` is read in render() with setState({}) as the invalidation trigger.
 */
export interface BrushState {
  active: boolean;
  start: number;
  end: number;
  overlay: { x: number; width: number; top: number; height: number } | null;
}
