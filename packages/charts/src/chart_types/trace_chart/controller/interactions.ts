/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { announceLane, scrollLaneIntoView } from './accessibility';
import {
  DBLCLICK_DEBOUNCE_MS,
  KEY_PAN_FRACTION,
  KEY_ZOOM_STEP,
  LONG_PRESS_MS,
  TAP_MOVE_TOLERANCE_PX,
  WHEEL_ZOOM_VELOCITY,
} from './constants';
import { zoomLocked } from './frame';
import {
  buildBadgeEvent,
  clearHoveredAnnotation,
  clearHoveredBadge,
  enterAnnotationHover,
  enterBadgeHover,
  pinAt,
  updateHover,
} from './hover_pin';
import { getPipeline, getStyle } from './pipeline';
import {
  commitSegmentSelection,
  commitSpanSelection,
  fireCollapseChange,
  fireSelectionChange,
  getEffectiveCollapsed,
  getEffectiveSelection,
  setLocalCollapsed,
  setLocalSelection,
  toggleDisclosureAt,
} from './selection';
import type { TraceCanvasController } from './trace_canvas_controller';
import { clamp } from '../../../utils/common';
import {
  doPanFromPosition,
  doZoomAroundPosition,
  endDrag,
  markDragStartPosition,
  multiplierToZoom,
  resetTouchZoom,
  startTouchZoom,
} from '../../timeslip/projections/zoom_pan';
import { zoomSafePointerX, zoomSafePointerY } from '../../timeslip/utils/dom';
import { eraseMultitouch, setNewMultitouch, touchMidpoint } from '../../timeslip/utils/multitouch';
import { pickAnnotation, pickBadge, pickRegion } from '../render/canvas2d_renderer';
import {
  computeMaxScroll,
  computeZoomMax,
  domainToZoomPan,
  mapTouchesToCanvasX,
  pinchRatio,
  pixelRangeToDomain,
  resolveMinVisibleExtent,
} from '../render/interaction';
import { buildTraceAnnotationEvent, buildTraceEvent } from '../render/tooltip';
import { gutterPx } from '../render/types';
import { applySelection, selectionModeFromEvent } from '../selection_helpers';
import type { TraceSegmentRef } from '../trace_api';

/**
 * Assigns all canvas/window event handlers onto the controller and attaches them. Idempotent
 * per instance: called once from `start()`. Mirrors the previous component `setupEventHandlers`.
 * @internal
 */
export function setupEventHandlers(c: TraceCanvasController) {
  const canvas = c.deps.getCanvas();
  if (!canvas) return;

  c.handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Clear stale tooltip during zoom — mirrors Flame's smartDraw hover suppression.
    updateHover(c, null);

    const props = c.deps.getProps();
    if (!props.traceSpec) return;
    if (zoomLocked(c)) return; // Spec 30: wheel is a no-op while zoom is locked
    const style = getStyle(c);
    const plotLeft = gutterPx(style);
    const plotWidth = props.chartDimensions.width - plotLeft;

    c.easeZoom = true;
    doZoomAroundPosition(
      c.zoomPan,
      { innerSize: plotWidth, innerLeading: plotLeft },
      zoomSafePointerX(e),
      (-e.deltaY / plotWidth) * WHEEL_ZOOM_VELOCITY,
      0,
      false,
    );

    // Clamp zoom so the visible extent never drops below the scale-appropriate floor:
    // 1 ms for 'time' (ADR 0004 Decision 3), 1 ns for 'linear' (ADR 0010).
    const { domain } = getPipeline(c, props.traceSpec);
    const referenceExtentMs = domain.max - domain.min;
    c.zoomPan.focus.zoom = Math.min(
      c.zoomPan.focus.zoom,
      computeZoomMax(
        referenceExtentMs,
        resolveMinVisibleExtent(props.traceSpec.xScaleType, props.traceSpec.minVisibleExtent),
      ),
    );

    c.scheduleRender?.();
  };

  c.handleMouseDown = (e: MouseEvent) => {
    // Span badge press (Spec 27): remember the badge under pointer-down so a same-badge pointer-up
    // can activate it. A subsequent drag invalidates activation via the `dragMoved` guard on click.
    c.badgePointerDown = null;
    if (c.hover.lastGeom && c.hover.lastGeom.badgesByLane.size > 0) {
      const bp = pickBadge(zoomSafePointerX(e), zoomSafePointerY(e), c.hover.lastGeom);
      const bpSpan = bp ? c.hover.lastGeom.spans[bp.laneIndex] : undefined;
      if (bp && bpSpan) c.badgePointerDown = { spanId: bpSpan.id, badgeId: String(bp.item.badge.id) };
    }

    // Annotation press (Spec 29): remember the annotation under pointer-down so a same-annotation
    // pointer-up can activate it (down+up gating).
    c.annotationPointerDown = null;
    if (c.hover.lastGeom && c.hover.lastGeom.annotationsLayout.length > 0) {
      const ap = pickAnnotation(zoomSafePointerX(e), zoomSafePointerY(e), c.hover.lastGeom);
      if (ap) c.annotationPointerDown = { id: ap.id };
    }

    const props = c.deps.getProps();
    const dragMode = props.traceSpec?.dragMode ?? 'pan';
    // isBrushMode: XOR — Shift inverts the configured gesture so both dragMode values are reachable
    // from the keyboard. Spec 30: a locked chart pans for every dragMode/modifier.
    const isBrushMode = !zoomLocked(c) && (dragMode === 'brush') !== e.shiftKey;
    if (isBrushMode) {
      c.brush.active = true;
      c.brush.start = zoomSafePointerX(e);
      c.brush.end = c.brush.start; // zero-width seed so mouseup no-ops a plain click
      c.flywheelActive = false; // stop any coast before the brush gesture
      c.hover.dragMoved = false;
      if (c.clickTimer !== null) {
        clearTimeout(c.clickTimer);
        c.clickTimer = null;
      }
      if (c.hover.lastGeom) {
        const { plot } = c.hover.lastGeom;
        c.brush.overlay = { x: c.brush.start, width: 0, top: plot.top, height: plot.height };
      }
      updateHover(c, null);
      // A brush gesture owns the pointer immediately: exit any hovered badge/annotation and suspend
      // their hit testing until the gesture ends (Spec 27/29).
      clearHoveredBadge(c);
      clearHoveredAnnotation(c);
      c.deps.requestRender();
      return;
    }
    c.hover.dragMoved = false;
    // Cancel any pending single-click selection commit — a new gesture sequence starts here.
    if (c.clickTimer !== null) {
      clearTimeout(c.clickTimer);
      c.clickTimer = null;
    }
    c.easeZoom = false;
    c.flywheelActive = false;
    // Clear stale tooltip during drag — mirrors Flame's smartDraw hover suppression.
    updateHover(c, null);
    markDragStartPosition(c.zoomPan, zoomSafePointerX(e));
    c.dragStartY = zoomSafePointerY(e);
    c.dragStartScrollOffset = c.scrollOffset;
  };

  c.handleMouseMove = (e: MouseEvent) => {
    if (e.buttons !== 1) return; // only while primary button held

    if (c.brush.active) {
      // Update rubber-band extent. Clamp to plot bounds (clamp-and-continue on canvas-leave).
      const geom = c.hover.lastGeom;
      if (geom) {
        const { plot } = geom;
        const x = clamp(zoomSafePointerX(e), plot.left, plot.left + plot.width);
        c.brush.end = x;
        const left = Math.min(c.brush.start, x);
        c.brush.overlay = { x: left, width: Math.abs(c.brush.start - x), top: plot.top, height: plot.height };
      }
      c.hover.dragMoved = true; // suppress the post-drag click
      c.deps.requestRender();
      return;
    }

    c.hover.dragMoved = true; // distinguish a genuine click from a pan-then-release
    // A pan gesture is now recognized: exit any hovered badge/annotation and suspend their hit
    // testing until the gesture ends (Spec 27/29). Idempotent while the drag continues.
    clearHoveredBadge(c);
    clearHoveredAnnotation(c);

    const props = c.deps.getProps();
    if (!props.traceSpec) return;
    const style = getStyle(c);
    const plotWidth = props.chartDimensions.width - gutterPx(style);
    const plotHeight = props.chartDimensions.height - style.timeBarHeight;
    const { spans } = getPipeline(c, props.traceSpec);

    // Horizontal pan: 1:1 via doPanFromPosition (this projection tracks dragVelocity for coast)
    doPanFromPosition(c.zoomPan, plotWidth, zoomSafePointerX(e));

    // Vertical pan: direct scrollOffset adjustment, clamped (no kinetics)
    const maxScroll = computeMaxScroll(spans.length, style.laneHeight, plotHeight);
    c.scrollOffset = Math.min(Math.max(0, c.dragStartScrollOffset - (zoomSafePointerY(e) - c.dragStartY)), maxScroll);

    c.scheduleRender?.();
  };

  c.handleMouseUp = () => {
    if (c.brush.active) {
      c.brush.active = false;
      c.brush.overlay = null;
      const geom = c.hover.lastGeom;
      const spec = c.deps.getProps().traceSpec;
      if (!geom || !spec) {
        c.deps.requestRender();
        return;
      }
      // Use the last clamped brushEnd (set in mousemove). If no mousemove fired (zero-width click),
      // brushEnd === brushStart, giving a zero range → below minExtent → no-op.
      const [from, to] = pixelRangeToDomain(c.brush.start, c.brush.end, geom);
      const minExtent = resolveMinVisibleExtent(spec.xScaleType, spec.minVisibleExtent);
      if (to - from < minExtent) {
        c.deps.requestRender();
        return;
      }
      const { domain } = getPipeline(c, spec);
      const clampedFrom = clamp(from, domain.min, domain.max);
      const clampedTo = clamp(to, domain.min, domain.max);
      if (clampedTo - clampedFrom < minExtent) {
        c.deps.requestRender();
        return;
      }
      c.zoomPan.focus = domainToZoomPan([clampedFrom, clampedTo], [domain.min, domain.max]);
      c.zoomPan.focus.zoom = Math.min(c.zoomPan.focus.zoom, computeZoomMax(domain.max - domain.min, minExtent));
      c.easeZoom = true;
      c.flywheelActive = false;
      c.scheduleRender?.();
      c.deps.requestRender();
      return;
    }
    endDrag(c.zoomPan); // copies dragVelocity → flyVelocity
    c.flywheelActive = true; // main frame's kineticFlywheel branch owns the coast
    c.scheduleRender?.();
  };

  // Hover: separate canvas listener, disjoint from the window drag handler above (guarded by buttons).
  c.handleHoverMove = (e: MouseEvent) => {
    if (e.buttons === 1) return; // dragging → window handler owns it
    if (!c.hover.lastGeom) return;
    const px = (c.hover.pointerX = zoomSafePointerX(e)); // canvas-relative CSS px, DPR-agnostic → matches geom units
    const py = (c.hover.pointerY = zoomSafePointerY(e));
    const geom = c.hover.lastGeom;
    // Resolve which drawn element owns the pointer before emitting anything. Precedence:
    // annotation > badge > span (Spec 29 / ADR 0033, then Spec 27). Because badge/annotation/span
    // hover all funnel through the shared channel, we must clear the lower-priority hovers (each
    // emitting at most one `onElementOut`) BEFORE emitting the owner's `onElementOver`.
    const annHit = geom.annotationsLayout.length > 0 ? pickAnnotation(px, py, geom) : null;
    if (annHit) {
      updateHover(c, null); // span out (idempotent)
      clearHoveredBadge(c); // badge out (idempotent)
      enterAnnotationHover(c, annHit, px, py); // annotation over (or unchanged)
      return;
    }
    clearHoveredAnnotation(c); // annotation out if one was hovered

    const badgeHit = geom.badgesByLane.size > 0 ? pickBadge(px, py, geom) : null;
    const badgeSpan = badgeHit ? geom.spans[badgeHit.laneIndex] : undefined;
    if (badgeHit && badgeSpan) {
      updateHover(c, null); // span out (idempotent)
      enterBadgeHover(c, badgeHit, badgeSpan, px, py); // badge over (or unchanged)
      return;
    }
    clearHoveredBadge(c); // badge out if one was hovered

    updateHover(c, pickRegion(px, py, geom));
  };

  // Click: only fires for genuine clicks — not for pan-then-release (dragMoved guards this).
  c.handleCanvasClick = (e: MouseEvent) => {
    if (c.pin.pinned) return;
    if (c.hover.dragMoved) return;
    const props = c.deps.getProps();
    if (!c.hover.lastGeom || !props.traceSpec) return;

    const cx = zoomSafePointerX(e);
    const cy = zoomSafePointerY(e);

    // Annotation activation (Spec 29 / ADR 0033): an annotation owns the click and takes precedence
    // over badge and span clicks.
    if (c.hover.lastGeom.annotationsLayout.length > 0) {
      const ap = pickAnnotation(cx, cy, c.hover.lastGeom);
      const adown = c.annotationPointerDown;
      c.annotationPointerDown = null;
      if (ap) {
        if (adown && adown.id === ap.id) {
          props.onElementClick([buildTraceAnnotationEvent(ap.annotation, { chartX: cx, chartY: cy })]);
        }
        return;
      }
    }

    // Span badge activation (Spec 27): a badge owns the click.
    if (c.hover.lastGeom.badgesByLane.size > 0) {
      const bp = pickBadge(cx, cy, c.hover.lastGeom);
      const down = c.badgePointerDown;
      c.badgePointerDown = null;
      if (bp) {
        const span = c.hover.lastGeom.spans[bp.laneIndex];
        if (span && down && down.spanId === span.id && down.badgeId === String(bp.item.badge.id)) {
          props.onElementClick([buildBadgeEvent(bp.item.badge, span, cx, cy)]);
        }
        return;
      }
    }

    // Caret click: toggle collapse for the lane under the disclosure caret (Spec 21 / ADR 0026).
    if (toggleDisclosureAt(c, cx, cy)) return;

    const result = pickRegion(cx, cy, c.hover.lastGeom);

    // onElementClick fires immediately on every raw click (Spec 7), unchanged.
    if (result && result.index >= 0) {
      const span = c.hover.lastGeom.spans[result.index];
      if (span) props.onElementClick([buildTraceEvent(span)]);
    }

    // Schedule single-select commit (~250 ms) so a double-click can cancel it first (ADR 0011 D6).
    if (c.clickTimer !== null) {
      clearTimeout(c.clickTimer);
      c.clickTimer = null;
    }
    const geomSnapshot = c.hover.lastGeom;
    // Capture mode at click time; timer fires ~250 ms later after event is gone.
    const mode = selectionModeFromEvent(e);

    c.clickTimer = setTimeout(() => {
      c.clickTimer = null;
      commitSegmentSelection(c, result, geomSnapshot, mode);
    }, DBLCLICK_DEBOUNCE_MS);
  };

  // Double-click: select whole span. Cancels the pending single-click timer.
  c.handleDblClick = (e: MouseEvent) => {
    if (c.hover.dragMoved) return;
    if (!c.hover.lastGeom || !c.deps.getProps().traceSpec) return;

    // Cancel the first-click timer — double-click supersedes it.
    if (c.clickTimer !== null) {
      clearTimeout(c.clickTimer);
      c.clickTimer = null;
    }

    const result = pickRegion(zoomSafePointerX(e), zoomSafePointerY(e), c.hover.lastGeom);
    if (!result) return;
    commitSpanSelection(c, result, c.hover.lastGeom, selectionModeFromEvent(e));
  };

  c.handleCanvasLeave = () => {
    // Leaving the chart while a Span badge / annotation is hovered emits one onBadgeOut /
    // onAnnotationOut (Spec 27 / Spec 29).
    clearHoveredBadge(c);
    clearHoveredAnnotation(c);
    updateHover(c, null);
  };

  // Right-click to pin. Mirrors flame_chart.tsx handleContextMenu.
  c.handleContextMenu = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // suppress browser context menu
    if (c.pin.pinned) {
      c.handleUnpinningTooltip?.();
      return;
    }
    pinAt(c, zoomSafePointerX(e), zoomSafePointerY(e));
  };

  c.handleKeyUp = ({ key }: KeyboardEvent) => {
    if (key !== 'Escape') return;
    // Route through the single unpin path so every window listener added in pinAt is removed.
    c.handleUnpinningTooltip?.();
  };

  c.handleUnpinningTooltip = () => {
    window.removeEventListener('keyup', c.handleKeyUp);
    window.removeEventListener('click', c.handleUnpinningTooltip);
    window.removeEventListener('visibilitychange', c.handleUnpinningTooltip);
    c.pinTooltip(false);
  };

  // Keyboard navigation (Spec 12). Bound on the canvas; Tab is NOT prevented (no focus trap).
  c.handleKeyDown = (e: KeyboardEvent) => {
    const geom = c.hover.lastGeom;
    const spec = c.deps.getProps().traceSpec;

    // Pan (←/→) and zoom (+/-) work regardless of focusedLaneIndex.
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (!spec || !geom) return;
      const { domain } = getPipeline(c, spec);
      const focusDomain = c.tweenDomain;
      const extent = focusDomain.max - focusDomain.min;
      const delta = (e.key === 'ArrowLeft' ? -1 : 1) * extent * KEY_PAN_FRACTION;
      const newFrom = clamp(focusDomain.min + delta, domain.min, domain.max - extent);
      const newTo = newFrom + extent;
      c.zoomPan.focus = domainToZoomPan([newFrom, newTo], [domain.min, domain.max]);
      c.easeZoom = false; // 1:1 snap — domainTween cannot ease a pan (ADR 0004)
      c.scheduleRender?.();
      return;
    }
    // Spec 30: the +/=/- zoom keys no-op while zoom is locked; Arrow-key pan (above) still works.
    if ((e.key === '+' || e.key === '=' || e.key === '-') && zoomLocked(c)) return;
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      if (!spec) return;
      const style = getStyle(c);
      const plotLeft = gutterPx(style);
      const plotWidth = c.deps.getProps().chartDimensions.width - plotLeft;
      c.easeZoom = true;
      doZoomAroundPosition(
        c.zoomPan,
        { innerSize: plotWidth, innerLeading: plotLeft },
        plotLeft + plotWidth / 2,
        KEY_ZOOM_STEP,
        0,
        false,
      );
      const { domain } = getPipeline(c, spec);
      c.zoomPan.focus.zoom = Math.min(
        c.zoomPan.focus.zoom,
        computeZoomMax(domain.max - domain.min, resolveMinVisibleExtent(spec.xScaleType, spec.minVisibleExtent)),
      );
      c.scheduleRender?.();
      return;
    }
    if (e.key === '-') {
      e.preventDefault();
      if (!spec) return;
      const style = getStyle(c);
      const plotLeft = gutterPx(style);
      const plotWidth = c.deps.getProps().chartDimensions.width - plotLeft;
      c.easeZoom = true;
      doZoomAroundPosition(
        c.zoomPan,
        { innerSize: plotWidth, innerLeading: plotLeft },
        plotLeft + plotWidth / 2,
        -KEY_ZOOM_STEP,
        0,
        false,
      );
      c.scheduleRender?.();
      return;
    }

    // Lane-navigation keys require spans to be available.
    if (!geom || geom.spans.length === 0) return;
    const lastIndex = geom.spans.length - 1;

    const moveFocus = (newIndex: number) => {
      c.focusedLaneIndex = newIndex;
      scrollLaneIntoView(c, newIndex, { align: 'nearest' });
      const span = geom.spans[newIndex];
      // textContent assignment is XSS-safe — never innerHTML.
      if (span) announceLane(c, span);
      c.scheduleRender?.();
    };

    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        const current = c.focusedLaneIndex ?? 0;
        moveFocus(Math.max(0, current - 1));

        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        const current = c.focusedLaneIndex ?? -1;
        moveFocus(Math.min(lastIndex, current + 1));

        break;
      }
      case 'Home': {
        e.preventDefault();
        moveFocus(0);

        break;
      }
      case 'End': {
        e.preventDefault();
        moveFocus(lastIndex);

        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (c.focusedLaneIndex !== null) {
          const span = geom.spans[c.focusedLaneIndex];
          if (span) {
            c.deps.getProps().onElementClick([buildTraceEvent(span)]);
            // Keyboard: whole-span selection — plain = replace, Shift = additive, Cmd/Ctrl = toggle.
            const ref: TraceSegmentRef = { spanId: span.id, region: 'span' };
            const current = getEffectiveSelection(c);
            const mode = selectionModeFromEvent(e);
            const next = applySelection(current, ref, mode);
            setLocalSelection(c, next);
            fireSelectionChange(c, next);
            // Announce keyboard-initiated selection via aria-live (G4). Mouse stays silent.
            const ariaLive = c.deps.getAriaLive();
            if (ariaLive) {
              let utterance: string;
              if (next.length > current.length) {
                utterance = next.length === 1 ? `Selected ${span.name}` : `${span.name} added, ${next.length} selected`;
              } else if (next.length < current.length) {
                utterance = `${span.name} removed, ${next.length} selected`;
              } else {
                // additive no-op (Shift on already-selected ref)
                utterance = `${span.name} already selected`;
              }
              ariaLive.textContent = utterance;
            }
            c.scheduleRender?.();
          }
        }

        break;
      }
      case 'c': {
        // 'c' toggles collapse on the focused parent lane (Spec 21 / ADR 0026).
        e.preventDefault();
        const laneOrder2 = spec?.laneOrder ?? 'tree';
        if (c.focusedLaneIndex !== null && laneOrder2 === 'tree') {
          const focusedSpan = geom.spans[c.focusedLaneIndex];
          if (focusedSpan && geom.disclosureByLane?.has(c.focusedLaneIndex)) {
            const spanId = focusedSpan.id;
            const next = new Set(getEffectiveCollapsed(c));
            const willCollapse = !next.has(spanId);
            if (willCollapse) next.add(spanId);
            else next.delete(spanId);
            setLocalCollapsed(c, next);
            fireCollapseChange(c, next);
            const ariaLive = c.deps.getAriaLive();
            if (ariaLive) {
              const descendantCount = geom.disclosureByLane.get(c.focusedLaneIndex)?.descendantCount ?? 0;
              ariaLive.textContent = willCollapse
                ? `Collapsed ${focusedSpan.name}, ${descendantCount} descendants hidden`
                : `Expanded ${focusedSpan.name}`;
            }
            c.scheduleRender?.();
          }
        }

        break;
      }
      case 'Escape': {
        e.preventDefault();
        c.focusedLaneIndex = null;
        // Route through the single unpin path so the window listeners are removed (idempotent when
        // not pinned).
        c.handleUnpinningTooltip?.();
        // Clear selection on Escape (ADR 0011 / plan step 8).
        const current = getEffectiveSelection(c);
        if (current.length > 0) {
          setLocalSelection(c, []);
          fireSelectionChange(c, []);
          // Announce keyboard-initiated selection clear via aria-live (G4).
          const ariaLive = c.deps.getAriaLive();
          if (ariaLive) {
            ariaLive.textContent = 'Selection cleared';
          }
        }
        c.scheduleRender?.();

        break;
      }
      // No default
    }
  };

  // Focus: show the keyboard badge. Only triggers a re-render (badge is a DOM sibling of the canvas).
  c.handleFocus = () => {
    if (!c.hasFocus) {
      c.hasFocus = true;
      c.deps.requestRender();
    }
  };

  c.handleBlur = () => {
    c.hasFocus = false;
    if (c.focusedLaneIndex !== null) {
      c.focusedLaneIndex = null;
      c.scheduleRender?.();
    } else {
      c.deps.requestRender();
    }
  };

  // -----------------------------------------------------------------------
  // Touch handlers (Spec 23 / ADR 0021)
  // -----------------------------------------------------------------------

  c.handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mapped = mapTouchesToCanvasX(e, rect.left);

    // Pinned: the first touch dismisses the pin and does nothing else.
    if (c.pin.pinned) {
      c.handleUnpinningTooltip?.();
      c.touch.tapStart = null;
      return;
    }

    if (mapped.length === 2) {
      // Pinch start
      setNewMultitouch(c.touch.multitouch, mapped);
      startTouchZoom(c.zoomPan);
      markDragStartPosition(c.zoomPan, touchMidpoint(mapped));
      if (c.longPressTimer !== null) {
        clearTimeout(c.longPressTimer);
        c.longPressTimer = null;
      }
      if (c.clickTimer !== null) {
        clearTimeout(c.clickTimer);
        c.clickTimer = null;
      }
      c.flywheelActive = false;
      updateHover(c, null);
    } else if (mapped.length === 1) {
      // Tap / long-press / drag candidate
      const t = e.touches[0]!;
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      c.easeZoom = false;
      c.flywheelActive = false;
      updateHover(c, null);
      markDragStartPosition(c.zoomPan, x);
      c.dragStartY = y;
      c.dragStartScrollOffset = c.scrollOffset;
      c.touch.tapStart = { x, y };
      c.touch.moved = false;
      c.touch.longPressFired = false;
      c.longPressTimer = setTimeout(() => {
        if (!c.touch.moved) {
          pinAt(c, x, y);
          c.touch.longPressFired = true;
        }
      }, LONG_PRESS_MS);
    }
  };

  c.handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mapped = mapTouchesToCanvasX(e, rect.left);

    if (mapped.length === 2) {
      // Pinch — zoom only (ADR 0021 Decision 2)
      const props = c.deps.getProps();
      if (!props.traceSpec) return;
      if (zoomLocked(c)) return; // Spec 30: pinch-zoom no-ops while locked; one-finger pan still works
      const style = getStyle(c);
      const plotLeft = gutterPx(style);
      const plotWidth = props.chartDimensions.width - plotLeft;
      const ratio = pinchRatio(c.touch.multitouch, mapped);
      doZoomAroundPosition(
        c.zoomPan,
        { innerSize: plotWidth, innerLeading: plotLeft },
        touchMidpoint(mapped),
        multiplierToZoom(ratio),
        0,
        true,
      );
      const { domain } = getPipeline(c, props.traceSpec);
      c.zoomPan.focus.zoom = Math.min(
        c.zoomPan.focus.zoom,
        computeZoomMax(
          domain.max - domain.min,
          resolveMinVisibleExtent(props.traceSpec.xScaleType, props.traceSpec.minVisibleExtent),
        ),
      );
      // Do NOT update c.touch.multitouch here — it must hold the INITIAL pinch positions.
      c.scheduleRender?.();
    } else if (mapped.length === 1) {
      // 1-finger pan — inert when tapStart is null (pinned-dismiss, ≥3-finger, etc.)
      if (c.touch.tapStart === null) return;

      const props = c.deps.getProps();
      if (!props.traceSpec) return;
      const style = getStyle(c);
      const plotWidth = props.chartDimensions.width - gutterPx(style);
      const plotHeight = props.chartDimensions.height - style.timeBarHeight;
      const { spans } = getPipeline(c, props.traceSpec);

      const t = e.touches[0]!;
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;

      const dx = x - c.touch.tapStart.x;
      const dy = y - c.touch.tapStart.y;
      if (!c.touch.moved && Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE_PX) {
        c.touch.moved = true;
        if (c.longPressTimer !== null) {
          clearTimeout(c.longPressTimer);
          c.longPressTimer = null;
        }
      }

      // Horizontal pan
      doPanFromPosition(c.zoomPan, plotWidth, x);

      // Vertical pan (same math as handleMouseMove)
      const maxScroll = computeMaxScroll(spans.length, style.laneHeight, plotHeight);
      c.scrollOffset = Math.min(Math.max(0, c.dragStartScrollOffset - (y - c.dragStartY)), maxScroll);

      c.scheduleRender?.();
    }
  };

  c.handleTouchEnd = (e: TouchEvent) => {
    if (c.longPressTimer !== null) {
      clearTimeout(c.longPressTimer);
      c.longPressTimer = null;
    }

    const prevTouchCount = c.touch.multitouch.length;

    if (prevTouchCount === 2 && e.touches.length < 2) {
      // End of pinch
      eraseMultitouch(c.touch.multitouch);
      resetTouchZoom(c.zoomPan);
      if (e.touches.length === 1) {
        // One finger remains — treat as active drag (resolution 1)
        const rect = canvas.getBoundingClientRect();
        const t = e.touches[0]!;
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        markDragStartPosition(c.zoomPan, x);
        c.dragStartY = y;
        c.dragStartScrollOffset = c.scrollOffset;
        c.touch.tapStart = { x, y };
        c.touch.moved = true; // it's a continuation of pinch → treat as drag, never as tap
      }
      return;
    }

    // Long-press already fired — pin is showing; suppress the release-tap
    if (c.touch.longPressFired) {
      c.touch.longPressFired = false;
      c.touch.tapStart = null;
      return;
    }

    // Inert: tapStart was never set (pinned-dismiss, ≥3-finger touches, etc.) (resolution 3)
    if (c.touch.tapStart === null) return;

    if (!c.touch.moved) {
      // Tap
      const { x, y } = c.touch.tapStart;
      const geomSnapshot = c.hover.lastGeom;

      // Caret tap: toggle collapse (resolution 4 — parity with mouse click)
      if (toggleDisclosureAt(c, x, y)) {
        c.touch.tapStart = null;
        return;
      }

      // Annotation tap (Spec 29 / ADR 0033): an annotation under it activates and owns the tap.
      if (geomSnapshot && geomSnapshot.annotationsLayout.length > 0) {
        const ap = pickAnnotation(x, y, geomSnapshot);
        if (ap) {
          c.deps.getProps().onElementClick([buildTraceAnnotationEvent(ap.annotation, { chartX: x, chartY: y })]);
          c.touch.tapStart = null;
          return;
        }
      }

      // Span badge tap (Spec 27): a badge under it activates and owns the tap.
      if (geomSnapshot && geomSnapshot.badgesByLane.size > 0) {
        const bp = pickBadge(x, y, geomSnapshot);
        if (bp) {
          const span = geomSnapshot.spans[bp.laneIndex];
          if (span) {
            c.deps.getProps().onElementClick([buildBadgeEvent(bp.item.badge, span, x, y)]);
          }
          c.touch.tapStart = null;
          return;
        }
      }

      if (geomSnapshot) {
        const result = pickRegion(x, y, geomSnapshot);
        if (result && result.index >= 0) {
          const span = geomSnapshot.spans[result.index];
          if (span) c.deps.getProps().onElementClick([buildTraceEvent(span)]);
        }

        // Double-tap disambiguation via the shared clickTimer (ADR 0021 Decision 4)
        if (c.clickTimer !== null) {
          // Second tap within debounce window → double-tap → select whole span
          clearTimeout(c.clickTimer);
          c.clickTimer = null;
          if (result) commitSpanSelection(c, result, geomSnapshot, 'replace');
        } else {
          // First tap → schedule segment selection (mode always 'replace' — no modifier keys on touch)
          c.clickTimer = setTimeout(() => {
            c.clickTimer = null;
            commitSegmentSelection(c, result, geomSnapshot, 'replace');
          }, DBLCLICK_DEBOUNCE_MS);
        }
      }
    } else {
      // Drag ended — start kinetic coast (mirrors handleMouseUp)
      endDrag(c.zoomPan);
      c.flywheelActive = true;
      c.scheduleRender?.();
    }

    c.touch.tapStart = null;
  };

  canvas.addEventListener('wheel', c.handleWheel, { passive: false });
  canvas.addEventListener('mousedown', c.handleMouseDown);
  canvas.addEventListener('mousemove', c.handleHoverMove);
  canvas.addEventListener('click', c.handleCanvasClick);
  canvas.addEventListener('dblclick', c.handleDblClick);
  canvas.addEventListener('mouseleave', c.handleCanvasLeave);
  canvas.addEventListener('contextmenu', c.handleContextMenu);
  canvas.addEventListener('keydown', c.handleKeyDown);
  canvas.addEventListener('focus', c.handleFocus);
  canvas.addEventListener('blur', c.handleBlur);
  canvas.addEventListener('touchstart', c.handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', c.handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', c.handleTouchEnd, { passive: false });
  canvas.addEventListener('touchcancel', c.handleTouchEnd, { passive: false });
  // mousemove and mouseup are bound to window so a fast flick that releases the pointer outside
  // the canvas still fires endDrag and triggers the kinetic flywheel coast. Mirrors Timeslip.
  window.addEventListener('mousemove', c.handleMouseMove);
  window.addEventListener('mouseup', c.handleMouseUp);
}

/**
 * Detaches all listeners assigned by {@link setupEventHandlers}. Idempotent (safe to call twice).
 * @internal
 */
export function teardownEventHandlers(c: TraceCanvasController) {
  const canvas = c.deps.getCanvas();
  if (!canvas) return;

  if (c.handleWheel) canvas.removeEventListener('wheel', c.handleWheel);
  if (c.handleMouseDown) canvas.removeEventListener('mousedown', c.handleMouseDown);
  if (c.handleHoverMove) canvas.removeEventListener('mousemove', c.handleHoverMove);
  if (c.handleCanvasClick) canvas.removeEventListener('click', c.handleCanvasClick);
  if (c.handleDblClick) canvas.removeEventListener('dblclick', c.handleDblClick);
  if (c.handleCanvasLeave) canvas.removeEventListener('mouseleave', c.handleCanvasLeave);
  if (c.handleContextMenu) canvas.removeEventListener('contextmenu', c.handleContextMenu);
  if (c.handleKeyDown) canvas.removeEventListener('keydown', c.handleKeyDown);
  if (c.handleFocus) canvas.removeEventListener('focus', c.handleFocus);
  if (c.handleBlur) canvas.removeEventListener('blur', c.handleBlur);
  if (c.handleMouseMove) window.removeEventListener('mousemove', c.handleMouseMove);
  if (c.handleMouseUp) window.removeEventListener('mouseup', c.handleMouseUp);
  if (c.handleTouchStart) canvas.removeEventListener('touchstart', c.handleTouchStart);
  if (c.handleTouchMove) canvas.removeEventListener('touchmove', c.handleTouchMove);
  if (c.handleTouchEnd) {
    canvas.removeEventListener('touchend', c.handleTouchEnd);
    canvas.removeEventListener('touchcancel', c.handleTouchEnd);
  }
  // Defensive: remove pin dismiss listeners in case the component unmounts while pinned.
  if (c.handleKeyUp) window.removeEventListener('keyup', c.handleKeyUp);
  if (c.handleUnpinningTooltip) {
    window.removeEventListener('click', c.handleUnpinningTooltip);
    window.removeEventListener('visibilitychange', c.handleUnpinningTooltip);
  }
}
