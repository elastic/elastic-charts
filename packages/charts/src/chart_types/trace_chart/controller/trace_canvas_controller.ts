/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CSSProperties } from 'react';

import { scrollToSpanById, syncControlProvider } from './accessibility';
import {
  redrawIfCanvasPropsChanged,
  resetView,
  runFrame,
  syncFocusDomain,
  syncViewKeyReset,
  tryCanvasContext,
} from './frame';
import { getActiveCursor, syncPinOnSpecChange, unpinTooltip } from './hover_pin';
import { setupEventHandlers, teardownEventHandlers } from './interactions';
import { getStyle } from './pipeline';
import { syncCollapseLifecycle, syncSelectionLifecycle } from './selection';
import type {
  AnnotationCache,
  CollapseCache,
  PipelineCache,
  TraceControllerDeps,
  TraceProps,
  TweenState,
} from './types';
import type { Theme } from '../../../utils/themes/theme';
import { initialZoomPan } from '../../timeslip/projections/zoom_pan';
import type { ZoomPan } from '../../timeslip/projections/zoom_pan';
import { withDeltaTime } from '../../timeslip/utils/animation';
import type { NormalizedSpan } from '../data/types';
import { BadgeImageCache } from '../render/badge_images';
import type { BadgeTextMeasurer } from '../render/badge_layout';
import { buildViewKey } from '../render/interaction';
import type { ViewKey } from '../render/interaction';
import type { AnnotationLayoutItem, BadgeLayoutItem } from '../render/types';
import type { buildTraceStyle } from '../theme';
import type { TraceSelection } from '../trace_api';
import type { BrushState, HoverState, PinState, TouchState } from '../trace_state';

/**
 * Framework-agnostic controller that owns every mutable interaction/render/pipeline/selection field
 * and the self-managed rAF loop for the trace chart (ADR 0004 Decision 1/5). The React component is
 * a thin shell that constructs this, forwards lifecycle (`start`/`update`/`destroy`), and renders the
 * canvas + DOM siblings from the controller's public view-state.
 *
 * Fields are intentionally public: the concern modules under `controller/` are free functions over
 * this instance. The class is `@internal` and never exported from the package, so there is no public
 * API surface here.
 * @internal
 */
export class TraceCanvasController {
  // DOM API Canvas2d resource
  ctx: CanvasRenderingContext2D | null = null;

  // RAF loop handle — owned rAF id so we can cancel on destroy.
  rafId: number | null = null;
  /** Set true in start(), false in destroy(); guards frame() post-unmount. */
  mounted = false;
  scheduleRender: (() => void) | null = null;

  // Zoom/pan state (time axis, horizontal)
  zoomPan: ZoomPan = initialZoomPan();

  // Tween state — NaN means "snap to target on first frame"
  tween: TweenState = { niceDomainMin: NaN, niceDomainMax: NaN };

  /**
   * When true the RAF frame eases the tween (zoom interaction just fired). When false (drag/mount)
   * the frame snaps tween directly to the getFocusDomain target — pan is 1:1 (ADR 0004 Decision 2).
   */
  easeZoom = false;

  /** True while the kinetic flywheel is coasting after drag-release. */
  flywheelActive = false;

  // Vertical scroll offset (px, clamped to [0, maxScroll])
  scrollOffset = 0;
  dragStartY = 0;
  dragStartScrollOffset = 0;

  // Memoized pipeline (normalize→resolveActive) — recomputed only when data/format/xScaleType change
  pipelineCache: PipelineCache | null = null;

  // Memoized annotation resolution (Spec 29). Kept SEPARATE from pipelineCache (unstable spec refs).
  annotationCache: AnnotationCache | null = null;

  // Memoized badge-only-gutter width (Spec 27, 'none' mode).
  badgeGutterCache: { spansRef: NormalizedSpan[]; badgeSize: string; labelPosition: string; width: number } | null =
    null;

  // Memoized display-child-count reserve (Spec 32). Keyed on (pipelineSpans, style) refs.
  childCountCache: { spansRef: NormalizedSpan[]; styleRef: object; width: number } | null = null;

  // Async cache for Span-badge images (Spec 27 / ADR 0029). A decoded image finishing off-frame
  // schedules a redraw so the placeholder is replaced without blocking the animation loop.
  badgeImages = new BadgeImageCache(() => this.scheduleRender?.());

  // Memoized style — recomputed only when the theme reference changes
  styleCache: { theme: Theme; style: ReturnType<typeof buildTraceStyle> } | null = null;

  // Badge/label text measurers, backed by the draw context. Instance fields (not per-frame closures)
  // so `frame()` doesn't reallocate them each rAF tick; `measureText` is transform-independent.
  measureBadgeText: BadgeTextMeasurer = (text, fontSize) => {
    const style = getStyle(this);
    this.ctx!.font = `${fontSize}px ${style.badge.fontFamily}`;
    return this.ctx!.measureText(text).width;
  };

  measureLabelText: BadgeTextMeasurer = (text, fontSize) => {
    const style = getStyle(this);
    this.ctx!.font = `${fontSize}px ${style.gutterLabel.fontFamily}`;
    return this.ctx!.measureText(text).width;
  };

  /**
   * Identifies the reference-domain semantics in effect. Compared on each update(); when it changes
   * the horizontal view resets to fit-all.
   */
  viewKey: ViewKey | null = null;

  // Stable bound method for the container-level wheel preventDefault (fixes the Spec 0 closure leak)
  preventScroll = (e: WheelEvent) => e.preventDefault();

  // Bound canvas event handlers — stored for removal in destroy()
  handleWheel: ((e: WheelEvent) => void) | null = null;
  handleMouseDown: ((e: MouseEvent) => void) | null = null;
  handleMouseMove: ((e: MouseEvent) => void) | null = null;
  handleMouseUp: (() => void) | null = null;

  // Hover / tooltip state — self-managed (not redux), following the Flame/Timeslip canvas family pattern.
  hover: HoverState = {
    lastGeom: null,
    index: -1,
    region: null,
    pointerX: NaN,
    pointerY: NaN,
    tooltipInfo: { header: null, values: [] },
    dragMoved: false,
  };

  // --- Span-badge pointer interaction state (Spec 27) ---
  hoveredBadge: {
    spanId: string;
    badgeId: string;
    laneIndex: number;
    item: BadgeLayoutItem;
    span: NormalizedSpan;
  } | null = null;

  badgePointerDown: { spanId: string; badgeId: string } | null = null;

  // --- Trace-annotation pointer interaction state (Spec 29) ---
  hoveredAnnotation: { id: string; item: AnnotationLayoutItem } | null = null;
  annotationPointerDown: { id: string } | null = null;
  handleHoverMove: ((e: MouseEvent) => void) | null = null;
  handleCanvasClick: ((e: MouseEvent) => void) | null = null;
  handleCanvasLeave: (() => void) | null = null;

  // Pin / sticky tooltip state — mirrors flame_chart.tsx pin machinery.
  pin: PinState = { pinned: false, x: NaN, y: NaN };
  handleContextMenu: ((e: MouseEvent) => void) | null = null;
  // Assigned unconditionally in setupEventHandlers() (called from start()) before any pin
  // interaction can run, so these use definite-assignment fields rather than nullable-plus-`!`.
  handleKeyUp!: (e: KeyboardEvent) => void;
  handleUnpinningTooltip!: () => void;

  // Brush-to-zoom state (Spec 11).
  brush: BrushState = { active: false, start: NaN, end: NaN, overlay: null };

  // Keyboard-nav / accessibility state (Spec 12).
  focusedLaneIndex: number | null = null;
  hasFocus = false;
  handleKeyDown: ((e: KeyboardEvent) => void) | null = null;
  handleFocus: (() => void) | null = null;
  handleBlur: (() => void) | null = null;

  // Selection state (Spec 13 / ADR 0011).
  selection: TraceSelection = [];
  clickTimer: ReturnType<typeof setTimeout> | null = null;
  lastFiredSelection: TraceSelection = [];
  /** Echo-suppression for onFocusDomainChange (Spec 16 / ADR 0007). Null until the first settle fires. */
  lastFiredDomain: [number, number] | null = null;

  /** Content-guard for onDataDiagnosticsChange (Spec 28). */
  lastFiredDiagnosticsKey: string | null = null;

  // Collapse state (Spec 21 / ADR 0026).
  collapsed: Set<string> = new Set();
  lastFiredCollapsed: Set<string> = new Set();
  collapsedFromProp: { ids: string[]; asSet: Set<string> } | null = null;
  collapseCache: CollapseCache | null = null;
  // Memoized spanId→laneIndex Map; rebuilt when the pipeline spans reference changes.
  spanIdToLane: Map<string, number> = new Map();
  handleDblClick: ((e: MouseEvent) => void) | null = null;

  // Touch gesture state (Spec 23 / ADR 0021).
  touch: TouchState = { multitouch: [], tapStart: null, moved: false, longPressFired: false };
  longPressTimer: ReturnType<typeof setTimeout> | null = null;
  handleTouchStart: ((e: TouchEvent) => void) | null = null;
  handleTouchMove: ((e: TouchEvent) => void) | null = null;
  handleTouchEnd: ((e: TouchEvent) => void) | null = null;

  constructor(readonly deps: TraceControllerDeps) {}

  /** Current tween domain — the smoothed focus window used for rendering and keyboard pan math. */
  get tweenDomain(): { min: number; max: number } {
    return { min: this.tween.niceDomainMin, max: this.tween.niceDomainMax };
  }

  /** Cursor for the canvas element — read by the host component's render(). */
  getCursor(): CSSProperties['cursor'] {
    return getActiveCursor(this);
  }

  /**
   * Spec 14 control callback: scroll the lane for span `id` into view. Stable arrow field so the same
   * reference can be handed to `controlProviderCallback`.
   */
  scrollToSpan = (id: string): void => scrollToSpanById(this, id);

  /**
   * Pins/unpins the tooltip. Stable arrow field handed to `BasicTooltip.pinTooltip` in render().
   */
  pinTooltip = (pinned: boolean): void => {
    if (!pinned) {
      unpinTooltip(this);
      return;
    }
    this.pin.pinned = true;
    this.pin.x = this.hover.pointerX;
    this.pin.y = this.hover.pointerY;
    this.deps.requestRender();
  };

  /** The rAF frame callback — stable arrow field wrapped by `withDeltaTime` in start(). */
  frame = (deltaT: number): void => runFrame(this, deltaT);

  // -------------------------------------------------------------------------
  // Lifecycle (mirrors the old componentDidMount / componentDidUpdate / componentWillUnmount)
  // -------------------------------------------------------------------------

  start(): void {
    this.mounted = true;
    tryCanvasContext(this);

    const props = this.deps.getProps();

    // Uncontrolled collapse: seed redux to match this fresh instance's fully-expanded canvas (ADR 0012).
    if (props.traceSpec?.collapsedSpanIds === undefined) {
      props.setTraceUncontrolledCollapsed([]);
    }

    // Fit-all snap (zoom=0, NaN tween → one RAF tick, then stops).
    resetView(this);
    // Seed the domain-semantics key so the first update() doesn't spuriously reset.
    this.viewKey = props.traceSpec ? buildViewKey(props.traceSpec) : null;

    // Build the RAF pipeline: withDeltaTime wraps frame for delta-time; we own the rAF id so we
    // can cancel it in destroy() (withAnimation hides the id with no cancel path).
    const timedRender = withDeltaTime((deltaT: number) => this.frame(deltaT));
    this.scheduleRender = () => {
      if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
      this.rafId = window.requestAnimationFrame(timedRender);
    };

    // Canvas interaction listeners
    setupEventHandlers(this);

    // Chart protocol: fire once on mount (like Timeslip/Flame).
    // Firing in update() creates an infinite update loop (see flame_chart.tsx:451).
    props.onChartRendered();
    props.onRenderChange(true);

    // Kick the first frame (snaps to fit-all)
    this.scheduleRender();

    // Container-level wheel preventDefault — must use stable reference for removal
    this.deps.getContainer()?.addEventListener('wheel', this.preventScroll, { passive: false });

    // Spec 14: register control callbacks with the caller (initial registration).
    // Must run after setupEventHandlers so scrollToSpan is fully operational.
    props.traceSpec?.controlProviderCallback?.({ scrollToSpan: this.scrollToSpan });
  }

  update(prevProps: TraceProps): void {
    if (!this.ctx) tryCanvasContext(this);
    syncViewKeyReset(this); // must run first: resets zoomPan/lastFiredDomain when scale changes
    syncFocusDomain(this, prevProps); // applies controlled focusDomain in the (possibly just-reset) space
    syncPinOnSpecChange(this, prevProps);
    syncSelectionLifecycle(this, prevProps);
    syncCollapseLifecycle(this, prevProps);
    syncControlProvider(this, prevProps.traceSpec);
    redrawIfCanvasPropsChanged(this, prevProps);
  }

  destroy(): void {
    this.mounted = false;
    // Cancel any pending rAF so frame() doesn't fire on a detached canvas post-unmount.
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    // Cancel pending single-click selection commit — prevents a re-render after unmount.
    if (this.clickTimer !== null) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    teardownEventHandlers(this);
    this.deps.getContainer()?.removeEventListener('wheel', this.preventScroll);

    // Clear the uncontrolled collapse published to redux so a later remount on the same store does not
    // inherit this instance's collapse set (screen-reader drift). No-op in controlled mode.
    const props = this.deps.getProps();
    if (props.traceSpec?.collapsedSpanIds === undefined) {
      props.setTraceUncontrolledCollapsed([]);
    }
  }
}
