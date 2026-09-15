/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CSSProperties } from 'react';

import { NOOP } from './constants';
import { getPipeline, getStyle } from './pipeline';
import type { TraceCanvasController } from './trace_canvas_controller';
import type { TraceProps } from './types';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import type { TraceBadgeElementEvent } from '../../../specs/settings';
import type { NormalizedSpan } from '../data/types';
import type { BadgePickResult } from '../render/canvas2d_renderer';
import { pickRegion } from '../render/canvas2d_renderer';
import {
  buildTraceAnnotationEvent,
  buildTraceBadgeEvent,
  buildTraceEvent,
  buildTraceTooltipInfo,
} from '../render/tooltip';
import type { AnnotationLayoutItem, BadgeLayoutItem, HoverRegion, PickResult, TraceGeometry } from '../render/types';

// -------------------------------------------------------------------------
// Hover / tooltip helpers
// -------------------------------------------------------------------------

/**
 * Cursor is `pointer` when over an active or waiting region (inside the span's extent).
 * @internal
 */
export function getActiveCursor(c: TraceCanvasController): CSSProperties['cursor'] {
  // Badges/annotations become interactive (pointer cursor, keyboard activation) when the consumer
  // wires the shared `Settings.onElementClick` handler — the single interaction channel in the
  // reshaped API. A hovered annotation takes precedence over badge/span cursors since it owns the
  // pointer (ADR 0030).
  const interactive = elementClickIsInteractive(c);
  if (c.hoveredAnnotation && interactive) return 'pointer';
  if (c.hoveredBadge && interactive) return 'pointer';
  if (c.hover.index >= 0 && c.hover.region !== 'empty') return 'pointer';
  return DEFAULT_CSS_CURSOR;
}

/**
 * True when the consumer supplied a real `Settings.onElementClick` handler (not the stable no-op
 * fallback), which is what makes badges and annotations interactive in the unified event model.
 * @internal
 */
export function elementClickIsInteractive(c: TraceCanvasController): boolean {
  return c.deps.getProps().onElementClick !== NOOP;
}

/** @internal */
export function rebuildTooltip(
  c: TraceCanvasController,
  span: NormalizedSpan,
  index: number,
  domainMin: number,
  region: HoverRegion,
  segmentIndex: number,
) {
  const style = getStyle(c);
  const criticalIntervals = c.hover.lastGeom?.criticalIntervalsByLane.get(index);
  // Resolve the synthetic display-parent name for a reparented orphan's "Displayed under" row (Spec 26).
  let displayParentName: string | undefined;
  const traceSpec = c.deps.getProps().traceSpec;
  if (span.reparentedToSpanId !== undefined && traceSpec) {
    displayParentName = getPipeline(c, traceSpec).spans.find((s) => s.id === span.reparentedToSpanId)?.name;
  }
  c.hover.tooltipInfo = buildTraceTooltipInfo(
    span,
    index,
    domainMin,
    region,
    span.color ?? style.activeSegmentColor,
    segmentIndex,
    criticalIntervals,
    displayParentName,
  );
}

/** @internal */
export function unpinTooltip(c: TraceCanvasController) {
  c.pin.pinned = false;
  c.pin.x = NaN;
  c.pin.y = NaN;
  // Recompute hover from current pointer so the tooltip resumes tracking on unpin.
  updateHover(
    c,
    c.hover.lastGeom && Number.isFinite(c.hover.pointerX)
      ? pickRegion(c.hover.pointerX, c.hover.pointerY, c.hover.lastGeom)
      : null,
  );
  c.deps.requestRender();
}

/**
 * Updates hover state, fires `onElement*` callbacks on lane-entry/exit, and schedules a React
 * re-render (DOM-only tooltip portal update; does not trigger a canvas rAF frame — see `update()`).
 *
 * Change-guarded: `requestRender` is only called when the index or region changed, or while hovering
 * (to reposition the tooltip as the pointer moves). Callbacks fire only on lane entry/exit.
 * @internal
 */
export function updateHover(c: TraceCanvasController, result: PickResult | null) {
  // While pinned, freeze content and index. zoom/pan/drag still work unobstructed because they
  // don't call requestRender; only this method does (indirectly via the requestRender calls below).
  if (c.pin.pinned) return;
  // While brushing, suppress hover — the rubber-band owns the pointer.
  if (c.brush.active) return;

  const props = c.deps.getProps();
  const newIndex = result ? result.index : -1;
  const prevIndex = c.hover.index;

  c.hover.index = newIndex;
  c.hover.region = result?.region ?? null;

  if (newIndex !== prevIndex) {
    // Lane changed (enter new lane or leave all lanes)
    if (newIndex >= 0 && c.hover.lastGeom && props.traceSpec) {
      const span = c.hover.lastGeom.spans[newIndex];
      if (span) {
        const { domain } = getPipeline(c, props.traceSpec);
        rebuildTooltip(c, span, newIndex, domain.min, c.hover.region!, result?.segmentIndex ?? -1);
        props.onElementOver([buildTraceEvent(span)]);
      }
    } else {
      c.hover.tooltipInfo = { header: null, values: [] };
      if (prevIndex >= 0) props.onElementOut();
    }
    c.deps.requestRender();
  } else if (newIndex >= 0) {
    // Same lane — update region (State row) and reposition tooltip with pointer.
    // Also update segmentIndex: the pointer may have crossed into a different active segment.
    if (c.hover.lastGeom && props.traceSpec) {
      const span = c.hover.lastGeom.spans[newIndex];
      if (span) {
        const { domain } = getPipeline(c, props.traceSpec);
        rebuildTooltip(c, span, newIndex, domain.min, c.hover.region!, result?.segmentIndex ?? -1);
      }
    }
    c.deps.requestRender();
  }
}

/**
 * Pins the tooltip at (x, y) when a span (or empty region with showTooltipOverEmpty) is under the
 * pointer, wiring the window-level dismiss listeners. No-op when the pointer is not over content.
 * @internal
 */
export function pinAt(c: TraceCanvasController, x: number, y: number) {
  if (!c.hover.lastGeom) return;
  const result = pickRegion(x, y, c.hover.lastGeom);
  const overSpan =
    result &&
    result.index >= 0 &&
    (result.region !== 'empty' || c.deps.getProps().traceSpec?.showTooltipOverEmpty === true);
  if (!overSpan) return;
  c.hover.pointerX = x;
  c.hover.pointerY = y;
  updateHover(c, result);
  window.addEventListener('keyup', c.handleKeyUp);
  window.addEventListener('click', c.handleUnpinningTooltip);
  window.addEventListener('visibilitychange', c.handleUnpinningTooltip);
  c.pinTooltip(true);
}

// -------------------------------------------------------------------------
// Span-badge pointer interaction (Spec 27)
// -------------------------------------------------------------------------

/**
 * Enters a hovered Span badge from a resolved hit, dispatching one `traceBadgeEvent` through
 * `Settings.onElementOver` on entry (Spec 27). The caller (handleHoverMove) has already cleared
 * span/annotation hover so the shared `onElementOut` fires before this `onElementOver`. Idempotent
 * when the same badge is still hovered. The clickable cursor is refreshed via `requestRender`.
 * @internal
 */
export function enterBadgeHover(
  c: TraceCanvasController,
  hit: BadgePickResult,
  span: NormalizedSpan,
  x: number,
  y: number,
): void {
  const badgeId = String(hit.item.badge.id);
  const prev = c.hoveredBadge;
  if (prev && prev.spanId === span.id && prev.badgeId === badgeId) return; // unchanged

  // Entering a different badge: exit the previous one first, then enter the new one.
  clearHoveredBadge(c);
  c.hoveredBadge = { spanId: span.id, badgeId, laneIndex: hit.laneIndex, item: hit.item, span };
  c.deps.getProps().onElementOver([buildBadgeEvent(hit.item.badge, span, x, y)]);
  // Refresh the cursor (pointer only when clickable). Cheap DOM-only re-render.
  c.deps.requestRender();
}

/**
 * Emits one `onElementOut` for the currently-hovered badge (if any) and clears the hover state.
 * @internal
 */
export function clearHoveredBadge(c: TraceCanvasController): void {
  const hovered = c.hoveredBadge;
  if (!hovered) return;
  c.hoveredBadge = null;
  c.deps.getProps().onElementOut();
  c.deps.requestRender();
}

/**
 * Emits one `onElementOut` if the hovered badge is no longer present/visible in `geom` (Spec 27) —
 * e.g. a data/spec change removed it or scrolled it out of the laid-out range. Called once per
 * frame with the freshly-built geometry.
 * @internal
 */
export function reconcileHoveredBadge(c: TraceCanvasController, geom: TraceGeometry): void {
  const hovered = c.hoveredBadge;
  if (!hovered) return;
  // Identity is by badge object reference (retained through the pipeline), so a re-derived badge
  // with the same id but a new object also counts as "removed" and correctly emits one onElementOut.
  const lane = geom.badgesByLane.get(hovered.laneIndex);
  const stillVisible = lane ? lane.items.some((item) => item.badge === hovered.item.badge) : false;
  if (!stillVisible) clearHoveredBadge(c);
}

/**
 * Builds a pointer-source {@link TraceBadgeElementEvent} (carries chart-relative coordinates).
 * @internal
 */
export function buildBadgeEvent(
  badge: BadgeLayoutItem['badge'],
  span: NormalizedSpan,
  chartX: number,
  chartY: number,
): TraceBadgeElementEvent {
  return buildTraceBadgeEvent(badge, span, { chartX, chartY });
}

// -------------------------------------------------------------------------
// Annotation pointer interaction (Spec 29)
// -------------------------------------------------------------------------

/**
 * Enters a hovered annotation from a resolved hit, dispatching one `traceAnnotationEvent` through
 * `Settings.onElementOver` on entry (Spec 29). The caller (handleHoverMove) has already cleared
 * span/badge hover so the shared `onElementOut` fires before this `onElementOver`. Idempotent when
 * the same annotation is still hovered. The clickable cursor is refreshed via `requestRender`.
 * @internal
 */
export function enterAnnotationHover(c: TraceCanvasController, hit: AnnotationLayoutItem, x: number, y: number): void {
  const prev = c.hoveredAnnotation;
  if (prev && prev.id === hit.id) return; // unchanged — same annotation still owns the pointer

  // Entering a different annotation: exit the previous one first, then enter the new one.
  clearHoveredAnnotation(c);
  c.hoveredAnnotation = { id: hit.id, item: hit };
  c.deps.getProps().onElementOver([buildTraceAnnotationEvent(hit.annotation, { chartX: x, chartY: y })]);
  // Refresh the cursor (pointer only when clickable). Cheap DOM-only re-render.
  c.deps.requestRender();
}

/**
 * Emits one `onElementOut` for the currently-hovered annotation (if any) and clears the state.
 * @internal
 */
export function clearHoveredAnnotation(c: TraceCanvasController): void {
  const hovered = c.hoveredAnnotation;
  if (!hovered) return;
  c.hoveredAnnotation = null;
  c.deps.getProps().onElementOut();
  c.deps.requestRender();
}

/**
 * Emits one `onElementOut` if the hovered annotation is no longer present in `geom` (Spec 29) —
 * e.g. a data/spec change removed it or it was culled from the laid-out (visible) set. Called once
 * per frame with the freshly-built geometry. Identity is by annotation id.
 * @internal
 */
export function reconcileHoveredAnnotation(c: TraceCanvasController, geom: TraceGeometry): void {
  const hovered = c.hoveredAnnotation;
  if (!hovered) return;
  const stillVisible = geom.annotationsLayout.some((item) => item.id === hovered.id);
  if (!stillVisible) clearHoveredAnnotation(c);
}

// Unpin when the spec changes (data or view — stale frozen index may no longer be valid).
// Only unpin when already pinned to avoid an unnecessary re-render. Routed through
/**
 * handleUnpinningTooltip so the window click/visibilitychange listeners are removed too.
 * @internal
 */
export function syncPinOnSpecChange(c: TraceCanvasController, prevProps: TraceProps) {
  if (c.pin.pinned && c.deps.getProps().traceSpec !== prevProps.traceSpec) {
    c.handleUnpinningTooltip?.();
  }
}
