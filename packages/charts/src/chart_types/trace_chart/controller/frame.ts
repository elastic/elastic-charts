/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FOCUS_DOMAIN_EPSILON } from './constants';
import { reconcileHoveredAnnotation, reconcileHoveredBadge } from './hover_pin';
import { getBadgeGutterWidth, getPipeline, getResolvedAnnotations, getStyle } from './pipeline';
import { getCollapseOutput, getEffectiveCollapsed, getEffectiveSelection } from './selection';
import type { TraceCanvasController } from './trace_canvas_controller';
import type { TraceProps } from './types';
import { domainTween } from '../../timeslip/projections/domain_tween';
import { getFocusDomain, initialZoomPan, kineticFlywheel } from '../../timeslip/projections/zoom_pan';
import type { TraceDataDiagnostics } from '../data/diagnostics';
import { layoutAnnotations } from '../render/annotation_layout';
import { layoutBadges } from '../render/badge_layout';
import { canvas2dRenderer, drawAnnotations, drawBadges } from '../render/canvas2d_renderer';
import { buildGeometry } from '../render/geometry';
import type { ViewKey } from '../render/interaction';
import {
  computeMaxScroll,
  computeZoomMax,
  domainToZoomPan,
  hasViewKeyChanged,
  resolveMinVisibleExtent,
} from '../render/interaction';
import type { TraceSpec } from '../trace_api';

/**
 * Builds a ViewKey from a spec. Extracted to DRY up the repeated literal.
 * @internal
 */
export function buildViewKey(spec: TraceSpec): ViewKey {
  return { xScaleType: spec.xScaleType, format: 'simple', traceId: spec.traceId };
}

/**
 * Snap the horizontal view to fit-all: zoom=0, NaN tween → one RAF frame snaps to the full
 * reference domain, then the loop stops. Does not touch `scrollOffset` — vertical lane scroll is
 * orthogonal to the x-domain (see CONTEXT.md: Scroll offset vs Focus domain).
 * @internal
 */
export function resetView(c: TraceCanvasController) {
  c.zoomPan = initialZoomPan();
  c.zoomPan.focus.zoom = 0;
  c.zoomPan.focus.pan = 0;
  c.tween = { niceDomainMin: NaN, niceDomainMax: NaN };
  c.easeZoom = false;
  c.flywheelActive = false;
  // Null-reset so the next fit-all settle fires onFocusDomainChange with the new full window
  // (Spec 16 / ADR 0007).
  c.lastFiredDomain = null;
}

/**
 * True when zoom gestures are locked (`zoomable: false`). Pan and all other interactions stay active (Spec 30).
 * @internal
 */
export function zoomLocked(c: TraceCanvasController): boolean {
  return c.deps.getProps().traceSpec?.zoomable === false;
}

/**
 * Reads (or re-reads) the canvas 2d context onto the controller.
 * @internal
 */
export function tryCanvasContext(c: TraceCanvasController) {
  const canvas = c.deps.getCanvas();
  c.ctx = canvas && canvas.getContext('2d');
}

// Reset the horizontal view when the reference-domain semantics change (xScaleType or format).
// Rationale: switching e.g. linear ↔ time shifts the domain origin (elapsed zero vs epoch-ms)
// without changing the extent. domainTween's extent-only completion metric declares "done" on the
// first frame and strands the view between the old and new origins — the "updates only on hover"
/**
 * creep. See ADR 0004 Decision 2 (addendum).
 * @internal
 */
export function syncViewKeyReset(c: TraceCanvasController) {
  const spec = c.deps.getProps().traceSpec;
  if (!spec) return;
  const newKey = buildViewKey(spec);
  if (hasViewKeyChanged(c.viewKey, newKey)) {
    resetView(c);
    c.viewKey = newKey;
  }
}

// Apply a controlled focusDomain prop, easing the view to the requested window (Spec 16 / ADR 0007).
// Ordering: must run AFTER syncViewKeyReset so that on a simultaneous scale+focusDomain change the
/**
 * view is reset to fit-all in the new coordinate space BEFORE applying the controlled window.
 * @internal
 */
export function syncFocusDomain(c: TraceCanvasController, prevProps: TraceProps) {
  const spec = c.deps.getProps().traceSpec;
  const fd = spec?.focusDomain;
  const prev = prevProps.traceSpec?.focusDomain;
  if (!fd) return;
  // Value comparison — inline array literals are safe and do not cause yank-back on unrelated re-renders.
  if (prev && fd[0] === prev[0] && fd[1] === prev[1]) return;
  // Echo-guard: incoming value matches our own last emission — skip (would cause jitter loop).
  if (!focusDomainDiffers(fd, c.lastFiredDomain)) return;
  const { domain } = getPipeline(c, spec);
  // Pre-seed: suppress the confirming echo that would otherwise fire at loop-stop.
  c.lastFiredDomain = fd;
  c.zoomPan.focus = domainToZoomPan(fd, [domain.min, domain.max]);
  c.zoomPan.focus.zoom = Math.min(
    c.zoomPan.focus.zoom,
    computeZoomMax(domain.max - domain.min, resolveMinVisibleExtent(spec.xScaleType, spec.minVisibleExtent)),
  );
  c.easeZoom = true;
  c.flywheelActive = false;
  c.scheduleRender?.();
}

// Redraw only when a canvas-affecting prop changed. Hover re-renders don't touch these props, so
/**
 * hover stays a DOM-only tooltip-portal update — no wasted rAF, no flag needed.
 * @internal
 */
export function redrawIfCanvasPropsChanged(c: TraceCanvasController, prevProps: TraceProps) {
  const props = c.deps.getProps();
  if (
    props.traceSpec !== prevProps.traceSpec ||
    props.theme !== prevProps.theme ||
    props.chartDimensions !== prevProps.chartDimensions ||
    // Annotations (Spec 29) live on a separate prop from traceSpec; a change to the composed
    // annotation child specs must redraw the canvas even when traceSpec is unchanged.
    props.annotationSpecs !== prevProps.annotationSpecs
  ) {
    c.scheduleRender?.();
  }
}

/**
 * Returns `true` when `a` and `prev` differ by more than `FOCUS_DOMAIN_EPSILON` in either the
 * extent ratio or the position relative to the VISIBLE extent (focus-extent-relative, so a
 * half-window pan fires at any zoom depth). `null` prev ⇒ always differs (first fire).
 * @internal
 */
export function focusDomainDiffers(a: [number, number], prev: [number, number] | null): boolean {
  if (!prev) return true;
  const aExtent = a[1] - a[0];
  const prevExtent = prev[1] - prev[0];
  const extentRatio = prevExtent > 0 ? Math.abs(1 - aExtent / prevExtent) : 1;
  const posRatio = aExtent > 0 ? Math.abs(a[0] - prev[0]) / aExtent : 0;
  return extentRatio > FOCUS_DOMAIN_EPSILON || posRatio > FOCUS_DOMAIN_EPSILON;
}

/**
 * Called at RAF-loop stop. Fires `onFocusDomainChange` with the settled visible window when
 * it differs from `lastFiredDomain` by more than `FOCUS_DOMAIN_EPSILON`. Updates `lastFiredDomain`
 * **before** invoking the callback (re-entrant safety).
 * @internal
 */
export function maybeFireFocusDomainChange(c: TraceCanvasController, refFrom: number, refTo: number) {
  const spec = c.deps.getProps().traceSpec;
  if (!spec?.onFocusDomainChange) return;
  const { domainFrom, domainTo } = getFocusDomain(c.zoomPan, refFrom, refTo);
  const settled: [number, number] = [domainFrom, domainTo];
  if (!focusDomainDiffers(settled, c.lastFiredDomain)) return;
  c.lastFiredDomain = settled;
  spec.onFocusDomainChange(settled);
}

/**
 * Fires `onDataDiagnosticsChange` when the report's content changed since the last emission
 * (Spec 28). Content-guarded via the precomputed `key` so identical reports on repeated frames are
 * suppressed. `lastFiredDiagnosticsKey` is updated **before** the callback for re-entrant safety.
 * @internal
 */
export function maybeEmitDiagnostics(
  c: TraceCanvasController,
  spec: TraceSpec,
  report: TraceDataDiagnostics,
  key: string,
) {
  if (!spec.onDataDiagnosticsChange) return;
  if (key === c.lastFiredDiagnosticsKey) return;
  c.lastFiredDiagnosticsKey = key;
  spec.onDataDiagnosticsChange(report);
}

// -------------------------------------------------------------------------
// RAF frame — reads props/state at call time so redux re-renders are seen
/**
 * -------------------------------------------------------------------------
 * @internal
 */
export function runFrame(c: TraceCanvasController, deltaT: number) {
  if (!c.mounted) return; // guard against post-unmount rAF callbacks
  if (!c.ctx) return;

  const props = c.deps.getProps();
  const {
    traceSpec,
    chartDimensions: { width, height },
  } = props;
  if (!traceSpec) return;

  const {
    spans: pipelineSpans,
    depthBySpan,
    hasParents,
    maxDepth,
    domain,
    projectionOffset,
    emptyReason,
    criticalIntervals,
    diagnostics: diagnosticsReport,
    diagnosticsKey,
  } = getPipeline(c, traceSpec);

  // Resolve composed annotations (Spec 29) against the pre-collapse prepared spans. Memoized
  // separately from getPipeline so unstable annotation-spec refs never invalidate the span pipeline.
  const {
    annotations: resolvedAnnotations,
    diagnostics: annotationReport,
    diagnosticsKey: annotationKey,
  } = getResolvedAnnotations(c, props.annotationSpecs, pipelineSpans, projectionOffset);

  // Data-change-driven diagnostics (Spec 28 / Spec 29): getPipeline and getResolvedAnnotations are
  // cache hits on viewport-only frames, so this only fires when prepared data/spec/annotations change.
  const combinedReport =
    annotationReport.issues.length === 0
      ? diagnosticsReport
      : { issues: [...diagnosticsReport.issues, ...annotationReport.issues] };
  maybeEmitDiagnostics(c, traceSpec, combinedReport, `${diagnosticsKey}|${annotationKey}`);

  // Tree-gating: collapse is a tree-mode feature (ADR 0026). Warn and ignore in chronological.
  const laneOrder = traceSpec.laneOrder ?? 'tree';
  if (process.env.NODE_ENV !== 'production' && laneOrder !== 'tree' && traceSpec.collapsedSpanIds) {
    // eslint-disable-next-line no-console
    console.warn(
      '[elastic-charts/trace] collapsedSpanIds is only supported in laneOrder="tree". ' +
        'In chronological mode descendants are not contiguous, so collapse is disabled.',
    );
  }
  // Spec 30: dragMode="brush" is unreachable while zoom is locked — all drags pan. Warn (dev only).
  if (
    process.env.NODE_ENV !== 'production' &&
    traceSpec.zoomable === false &&
    (traceSpec.dragMode ?? 'pan') === 'brush'
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      '[elastic-charts/trace] dragMode="brush" has no effect when zoomable={false}; ' +
        'all drags pan while zoom is locked.',
    );
  }
  const effectiveCollapsed = laneOrder === 'tree' ? getEffectiveCollapsed(c) : new Set<string>();
  const {
    spans,
    disclosure: disclosureByLane,
    rolledUpCriticalIntervals,
  } = getCollapseOutput(c, pipelineSpans, effectiveCollapsed, depthBySpan, criticalIntervals);

  const emptyMessage =
    emptyReason === 'trace-not-found'
      ? traceSpec.traceNotFoundMessage ?? `No spans found for trace "${traceSpec.traceId}"`
      : null;
  const style = getStyle(c);

  // --- Zoom/pan → target focus domain ---
  const target = getFocusDomain(c.zoomPan, domain.min, domain.max);

  // Ease-vs-snap split (domainTween's extent-only completion metric can't ease a pan)
  let tweenOngoing: boolean;
  if (c.easeZoom) {
    tweenOngoing = domainTween(c.tween, deltaT, target.domainFrom, target.domainTo);
  } else {
    // 1:1 snap: pan tracks the cursor directly
    c.tween.niceDomainMin = target.domainFrom;
    c.tween.niceDomainMax = target.domainTo;
    tweenOngoing = false;
  }

  // Kinetic flywheel coast (horizontal pan only; vertical has no kinetics)
  if (c.flywheelActive) {
    c.flywheelActive = kineticFlywheel(c.zoomPan, width);
    // After the flywheel step, sync the pan tween target (still 1:1 during coast)
    const coastTarget = getFocusDomain(c.zoomPan, domain.min, domain.max);
    c.tween.niceDomainMin = coastTarget.domainFrom;
    c.tween.niceDomainMax = coastTarget.domainTo;
  }

  // Clamp vertical scroll to content height
  c.scrollOffset = Math.min(
    c.scrollOffset,
    computeMaxScroll(spans.length, style.laneHeight, height - style.timeBarHeight),
  );

  // --- Span badges (Spec 27) ---
  // Text measurers are instance fields; measureText is transform-independent so this is safe before
  // the DPR setTransform below.
  const badgeSize = traceSpec.badgeSize ?? 'm';
  // Reserve the badge-only gutter ('none' mode) before partitioning so the plot accounts for it.
  const badgeGutterWidth = traceSpec.badgeAccessor
    ? getBadgeGutterWidth(c, spans, style, badgeSize, c.measureBadgeText)
    : 0;
  // In 'inline' mode, grow the label/badge row to the active badge height so inline badges sit in
  // their own row rather than spilling into the bar band (Spec 27). Only when badges are present.
  const badgeRowHeight =
    traceSpec.badgeAccessor && style.labelPosition === 'inline' && spans.some((s) => s.badges && s.badges.length > 0)
      ? style.badge[badgeSize].height
      : 0;

  // Build geometry and draw (spans are pre-sorted and domain pre-computed — no per-frame sort/reduce)
  const focusDomain = c.tweenDomain;
  const geomBase = buildGeometry(
    spans,
    { width, height },
    focusDomain,
    c.scrollOffset,
    style,
    traceSpec.xScaleType,
    domain,
    c.focusedLaneIndex,
    getEffectiveSelection(c),
    c.spanIdToLane,
    emptyMessage,
    disclosureByLane,
    hasParents,
    maxDepth,
    rolledUpCriticalIntervals,
    badgeGutterWidth,
    badgeRowHeight,
    traceSpec.spanDisplay ?? 'segments',
  );

  // Lay out badges over the visible lane range (measurement-dependent, so kept out of buildGeometry).
  let geom = geomBase;
  if (traceSpec.badgeAccessor) {
    const firstLane = Math.max(0, Math.floor(c.scrollOffset / style.laneHeight));
    const lastLane = Math.min(spans.length - 1, Math.floor((c.scrollOffset + geomBase.plot.height) / style.laneHeight));
    const badgesByLane = layoutBadges(
      geomBase,
      style,
      badgeSize,
      c.measureBadgeText,
      c.measureLabelText,
      firstLane,
      lastLane,
    );
    if (badgesByLane.size > 0) geom = { ...geomBase, badgesByLane };
  }

  // Lay out annotations over the current (post-collapse, scrolled, zoomed) frame (Spec 29). Kept out
  // of buildGeometry because it depends on the separately-memoized annotation resolution.
  if (resolvedAnnotations.length > 0) {
    const annotationsLayout = layoutAnnotations(geom, style, resolvedAnnotations);
    if (annotationsLayout.length > 0) geom = { ...geom, annotationsLayout };
  }

  // DPR scaling: renderer is dpr-agnostic, caller sets the transform each frame.
  const dpr = window.devicePixelRatio ?? 1;
  c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas2dRenderer.draw(c.ctx, geom, style);
  // Span badges are drawn in a second pass (Spec 27) so the frozen TraceRenderer.draw signature
  // (ADR 0001) stays image-resolver-free; no-op when no badge is laid out.
  drawBadges(c.ctx, geom, style, (src, crossOrigin) => c.badgeImages.get(src, crossOrigin));
  // Trace annotations draw last (Spec 29) so time markers/rails sit above the waterfall and badges.
  drawAnnotations(c.ctx, geom, style, c.hoveredAnnotation?.id);

  // Store for picking in hover/click handlers — single source of truth for the current layout.
  c.hover.lastGeom = geom;

  // If a data/spec change removed or hid the hovered Span badge, emit one onBadgeOut (Spec 27).
  reconcileHoveredBadge(c, geom);

  // If a data/spec change removed or culled the hovered annotation, emit one onAnnotationOut (Spec 29).
  reconcileHoveredAnnotation(c, geom);

  // Keep the loop alive only while there is work to do; fire the focus-domain callback at settle.
  if (tweenOngoing || c.flywheelActive) {
    c.scheduleRender?.();
  } else {
    maybeFireFocusDomainChange(c, domain.min, domain.max);
  }
}
