/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPipeline, getStyle } from './pipeline';
import type { TraceCanvasController } from './trace_canvas_controller';
import { Logger } from '../../../utils/logger';
import type { NormalizedSpan } from '../data/types';
import { computeMaxScroll, computeScrollTarget } from '../render/interaction';
import { formatMs } from '../render/tooltip';
import type { TraceSpec } from '../trace_api';

/**
 * Scrolls lane `index` into view using `computeScrollTarget`, then schedules a repaint.
 * Called by keyboard nav (align:'nearest') and reused by Spec 14 `scrollToSpan` (align:'center').
 * @internal
 */
export function scrollLaneIntoView(
  c: TraceCanvasController,
  index: number,
  { align }: { align: 'center' | 'nearest' },
) {
  const spec = c.deps.getProps().traceSpec;
  if (!spec) return;
  const style = getStyle(c);
  const { spans } = getPipeline(c, spec);
  const { height } = c.deps.getProps().chartDimensions;
  const plotHeight = height - style.timeBarHeight;
  const maxScroll = computeMaxScroll(spans.length, style.laneHeight, plotHeight);
  c.scrollOffset = computeScrollTarget(index, c.scrollOffset, plotHeight, style.laneHeight, maxScroll, align);
  c.scheduleRender?.();
}

/**
 * Announce a lane's span to the aria-live region. Shared by keyboard nav and scrollToSpan.
 * @internal
 */
export function announceLane(c: TraceCanvasController, span: NormalizedSpan): void {
  const ariaLive = c.deps.getAriaLive();
  if (ariaLive) {
    const skewNote = span.skewCorrected ? ' — time adjusted for clock skew' : '';
    // Partial-trace disclosure (Spec 26): announce orphan provenance and synthetic placement.
    let orphanNote = '';
    if (span.orphaned) {
      if (span.reparentedToSpanId !== undefined) {
        const { traceSpec } = c.deps.getProps();
        const parentName =
          (traceSpec &&
            getPipeline(c, traceSpec).spans.find((s: NormalizedSpan) => s.id === span.reparentedToSpanId)?.name) ??
          span.reparentedToSpanId;
        orphanNote = ` — orphan; displayed under ${parentName}`;
      } else {
        orphanNote = ' — orphan; used as display root';
      }
    }
    ariaLive.textContent = `${span.name} — ${formatMs(span.end - span.start)}${skewNote}${orphanNote}`;
  }
}

/**
 * Spec 14: scroll the lane for span `id` into view (centered), set the focused-lane highlight,
 * and announce via the aria-live region. Does NOT move DOM keyboard focus (no focus-steal).
 * @internal
 */
export function scrollToSpanById(c: TraceCanvasController, id: string): void {
  const spec = c.deps.getProps().traceSpec;
  if (!spec) return;
  const { spans } = getPipeline(c, spec); // ensures spanIdToLane is fresh
  const laneIndex = c.spanIdToLane.get(id);
  if (laneIndex === undefined) {
    Logger.warn(`Trace chart scrollToSpan: span id "${id}" not found; ignoring.`);
    return;
  }
  scrollLaneIntoView(c, laneIndex, { align: 'center' });
  c.focusedLaneIndex = laneIndex; // reuse Spec 12 focus highlight; repaint already scheduled
  const span = spans[laneIndex];
  if (span) announceLane(c, span); // a11y parity with keyboard moveFocus
}

/**
 * Re-registers the controlProviderCallback when its reference changes (idempotent per ADR 0008).
 * Called from `start()` (initial registration) and `update()`.
 * @internal
 */
export function syncControlProvider(c: TraceCanvasController, prevSpec: TraceSpec | undefined): void {
  const cb = c.deps.getProps().traceSpec?.controlProviderCallback;
  if (cb && cb !== prevSpec?.controlProviderCallback) {
    cb({ scrollToSpan: c.scrollToSpan });
  }
}
