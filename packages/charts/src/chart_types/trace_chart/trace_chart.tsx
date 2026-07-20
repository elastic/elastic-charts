/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CSSProperties, RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { normalize } from './data/normalize';
import { orderLanes } from './data/order_lanes';
import { resolveActive, waitingSegments } from './data/self_time';
import type { NormalizedSpan } from './data/types';
import { canvas2dRenderer, pickRegion } from './render/canvas2d_renderer';
import { buildGeometry } from './render/geometry';
import { gutterPx } from './render/types';
import type { ViewKey } from './render/interaction';
import { computeMaxScroll, computeScrollTarget, computeZoomMax, domainToZoomPan, hasViewKeyChanged, minVisibleExtentForScale, pixelRangeToDomain } from './render/interaction';
import { buildTraceEvent, buildTraceSelectionDetail, buildTraceTooltipInfo, formatMs } from './render/tooltip';
import { ScreenReaderTraceTable } from './render/screen_reader_trace_table';
import { AriaLiveRegion } from './render/aria_live_region';
import { BrushOverlay } from './render/brush_overlay';
import { KeyboardFocusBadge } from './render/keyboard_focus_badge';
import type { HoverRegion, PickResult } from './render/types';
import type { BrushState, HoverState, PinState } from './trace_state';
import { ScreenReaderSummary } from '../../components/accessibility';
import { buildTraceStyle } from './theme';
import { clamp } from '../../utils/common';
import { Logger } from '../../utils/logger';
import type { TraceSegmentRef, TraceSelection, TraceSpec } from './trace_api';
import { applySelection, selectionModeFromEvent, selectionSetEqual } from './selection_helpers';
import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import type { SettingsSpec } from '../../specs';
import { TooltipType } from '../../specs';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { onChartRendered } from '../../state/actions/chart';
import type { GlobalChartState } from '../../state/chart_state';
import type { BackwardRef, ChartRenderer } from '../../state/internal_chart_renderer';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { getSpecsFromStore } from '../../state/utils/get_specs_from_store';
import type { Size } from '../../utils/dimensions';
import type { Theme } from '../../utils/themes/theme';
import { BasicTooltip } from '../../components/tooltip/tooltip';
import { domainTween } from '../timeslip/projections/domain_tween';
import {
  initialZoomPan,
  doZoomAroundPosition,
  doPanFromPosition,
  markDragStartPosition,
  endDrag,
  kineticFlywheel,
  getFocusDomain,
} from '../timeslip/projections/zoom_pan';
import type { ZoomPan } from '../timeslip/projections/zoom_pan';
import { withDeltaTime } from '../timeslip/utils/animation';
import { zoomSafePointerX, zoomSafePointerY } from '../timeslip/utils/dom';

/**
 * Wheel zoom velocity: maps normalized wheel distance (deltaY/plotWidth) to zoom change.
 * Same order of magnitude as Timeslip's wheel handler.
 */
const WHEEL_ZOOM_VELOCITY = 3;

/** Debounce window for single-vs-double click disambiguation (ADR 0011 Decision 6). */
const DBLCLICK_DEBOUNCE_MS = 250;

/**
 * Keyboard pan fraction: one ←/→ keypress pans the visible time window by this fraction of its
 * current extent. 1:1 snap (easeZoom=false) per ADR 0004 Decision 2 — domainTween cannot ease pan.
 */
const KEY_PAN_FRACTION = 0.1;

/**
 * Keyboard zoom step: one +/- keypress applies this zoomChange (same sign/magnitude convention as
 * the wheel handler). Positive = zoom in. Eased via domainTween (easeZoom=true) like wheel zoom.
 */
const KEY_ZOOM_STEP = 0.5;

/**
 * Echo-suppression threshold for focusDomain change detection. Mirrors TWEEN_DONE_EPSILON from
 * `timeslip/projections/domain_tween.ts:13` — scale-invariant extent-ratio. Used for both the
 * extent-ratio and the focus-extent-relative position check (ADR 0007 §Echo-suppression).
 */
const FOCUS_DOMAIN_EPSILON = 0.001;

/** Stable no-op for BasicTooltip callback props that trace manages internally. */
const NOOP = () => {};
/** Stable empty array for BasicTooltip `selected` prop (trace has no tooltip item selection). */
const EMPTY: never[] = [];

interface StateProps {
  traceSpec: TraceSpec | undefined;
  theme: Theme;
  chartDimensions: Size;
  a11ySettings: ReturnType<typeof getA11ySettingsSelector>;
  tooltipRequired: boolean;
  onElementOver: NonNullable<SettingsSpec['onElementOver']>;
  onElementClick: NonNullable<SettingsSpec['onElementClick']>;
  onElementOut: NonNullable<SettingsSpec['onElementOut']>;
  onRenderChange: NonNullable<SettingsSpec['onRenderChange']>;
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface OwnProps {
  containerRef: BackwardRef;
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type TraceProps = StateProps & DispatchProps & OwnProps;

/** Memoized normalize→resolveActive output. Keyed on (data ref, xScaleType, traceId, colorBy ref, vizColors ref). */
interface PipelineCache {
  dataRef: TraceSpec['data'];
  xScaleType: string;
  traceId: string | undefined;
  colorBy: TraceSpec['colorBy'];
  laneOrder: TraceSpec['laneOrder'];
  vizColors: Theme['colors']['vizColors'];
  result: { spans: ReturnType<typeof resolveActive>; domain: { min: number; max: number }; emptyReason?: 'trace-not-found' };
}

/** Tween state for domainTween. Initialised to NaN so the first frame snaps to fit-all. */
interface TweenState {
  niceDomainMin: number;
  niceDomainMax: number;
}

class TraceComponent extends React.Component<TraceProps> {
  static displayName = 'Trace';

  // DOM API Canvas2d resource
  private ctx: CanvasRenderingContext2D | null = null;

  // RAF loop handle — owned rAF id so we can cancel on unmount.
  // withAnimation hides the id in a closure with no cancel path; we replicate its dedup logic here.
  private rafId: number | null = null;
  /** Set true in componentDidMount, false in componentWillUnmount; guards frame() post-unmount. */
  private mounted = false;
  private scheduleRender: (() => void) | null = null;

  // Zoom/pan state (time axis, horizontal)
  private zoomPan: ZoomPan = initialZoomPan();

  // Tween state — NaN means "snap to target on first frame"
  private tween: TweenState = { niceDomainMin: NaN, niceDomainMax: NaN };

  /**
   * When true the RAF frame eases the tween (zoom interaction just fired).
   * When false (drag/mount) the frame snaps tween directly to the getFocusDomain target — pan is
   * 1:1 because domainTween's extent-only completion metric can't ease a pure pan anyway.
   */
  private easeZoom = false;

  /** True while the kinetic flywheel is coasting after drag-release. */
  private flywheelActive = false;

  // Vertical scroll offset (px, clamped to [0, maxScroll])
  private scrollOffset = 0;
  private dragStartY = 0;
  private dragStartScrollOffset = 0;

  // Memoized pipeline (normalize→resolveActive) — recomputed only when data/format/xScaleType change
  private pipelineCache: PipelineCache | null = null;

  // Memoized style — recomputed only when the theme reference changes (mirrors pipelineCache pattern)
  private styleCache: { theme: Theme; style: ReturnType<typeof buildTraceStyle> } | null = null;

  /**
   * Identifies the reference-domain semantics in effect. Compared on each componentDidUpdate;
   * when it changes the horizontal view resets to fit-all. Preserves zoom across same-scale
   * data refreshes (data-ref changes do not reset the view).
   */
  private viewKey: ViewKey | null = null;

  // Stable bound method for the container-level wheel preventDefault (fixes the Spec 0 closure leak)
  private preventScroll = (e: WheelEvent) => e.preventDefault();

  // Bound canvas event handlers — stored for removal in componentWillUnmount
  private handleWheel: ((e: WheelEvent) => void) | null = null;
  private handleMouseDown: ((e: MouseEvent) => void) | null = null;
  private handleMouseMove: ((e: MouseEvent) => void) | null = null;
  private handleMouseUp: (() => void) | null = null;

  // Hover / tooltip state — self-managed (not redux), following the Flame/Timeslip canvas family pattern.
  // hover.lastGeom is written once per frame; all mouse handlers read it for picking without rebuilding geometry.
  private hover: HoverState = { lastGeom: null, index: -1, region: null, pointerX: NaN, pointerY: NaN, tooltipInfo: { header: null, values: [] }, dragMoved: false };
  private handleHoverMove: ((e: MouseEvent) => void) | null = null;
  private handleCanvasClick: ((e: MouseEvent) => void) | null = null;
  private handleCanvasLeave: (() => void) | null = null;

  // Pin / sticky tooltip state — mirrors flame_chart.tsx pin machinery.
  // pin.pinned=true freezes updateHover (content + index stay as-is); the frozen anchor positions
  // the tooltip while the pointer moves elsewhere or zoom/pan runs.
  private pin: PinState = { pinned: false, x: NaN, y: NaN };
  private handleContextMenu: ((e: MouseEvent) => void) | null = null;
  private handleKeyUp: ((e: KeyboardEvent) => void) | null = null;
  private handleUnpinningTooltip: (() => void) | null = null;

  // Brush-to-zoom state (Spec 11). brush.active gates the window drag handlers so a brush gesture
  // never also pans. brush.end tracks the last clamped x so mouseup has it even if the pointer
  // released outside the canvas. brush.overlay is read in render() with setState({}) as the trigger.
  private brush: BrushState = { active: false, start: NaN, end: NaN, overlay: null };

  // Keyboard-nav / accessibility state (Spec 12).
  // focusedLaneIndex: the lane currently selected by keyboard navigation. Distinct from hoverIndex.
  // Cleared on canvas blur or Escape. Passed into buildGeometry each frame for the canvas highlight.
  private focusedLaneIndex: number | null = null;
  // hasFocus: true while the canvas has DOM focus (set in handleFocus, cleared in handleBlur).
  // Drives the keyboard-badge focus indicator in render().
  private hasFocus = false;
  // Ref to the visually-hidden aria-live div. textContent is set (never innerHTML) after each lane move.
  private ariaLiveRef = React.createRef<HTMLDivElement>();
  private handleKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private handleFocus: (() => void) | null = null;
  private handleBlur: (() => void) | null = null;

  // Selection state (Spec 13 / ADR 0011). All selection is self-managed instance state (no setState,
  // no redux). The controlled prop path is: getEffectiveSelection() reads prop when present.
  private selection: TraceSelection = [];
  private clickTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFiredSelection: TraceSelection = [];
  /** Echo-suppression for onFocusDomainChange (Spec 16 / ADR 0007). Null until the first settle fires. */
  private lastFiredDomain: [number, number] | null = null;
  // Memoized spanId→laneIndex Map; rebuilt when the pipeline spans reference changes. Passed into
  // buildGeometry each frame to avoid rebuilding the Map per rAF frame (plan D4 / /review-claudio).
  private spanIdToLane: Map<string, number> = new Map();
  private handleDblClick: ((e: MouseEvent) => void) | null = null;

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Snap the horizontal view to fit-all: zoom=0, NaN tween → one RAF frame snaps to the full
   * reference domain, then the loop stops. Does not touch `scrollOffset` — vertical lane scroll is
   * orthogonal to the x-domain (see CONTEXT.md: Scroll offset vs Focus domain).
   */
  private resetView() {
    this.zoomPan = initialZoomPan();
    this.zoomPan.focus.zoom = 0;
    this.zoomPan.focus.pan = 0;
    this.tween = { niceDomainMin: NaN, niceDomainMax: NaN };
    this.easeZoom = false;
    this.flywheelActive = false;
    // Null-reset so the next fit-all settle fires onFocusDomainChange with the new full window
    // (Spec 16 / ADR 0007: "reset lastFiredDomain on data change so a fresh dataset doesn't suppress the first fire").
    this.lastFiredDomain = null;
  }

  /** Builds a ViewKey from a spec. Extracted to DRY up the 4× repeated literal. */
  private buildViewKey(spec: TraceSpec): ViewKey {
    return { xScaleType: spec.xScaleType, format: 'simple', traceId: spec.traceId };
  }

  /** Current tween domain — the smoothed focus window used for rendering and keyboard pan math. */
  private get tweenDomain(): { min: number; max: number } {
    return { min: this.tween.niceDomainMin, max: this.tween.niceDomainMax };
  }

  /**
   * Scrolls lane `index` into view using `computeScrollTarget`, then schedules a repaint.
   * Called by keyboard nav (align:'nearest') and reused by Spec 14 `scrollToSpan` (align:'center').
   */
  private scrollLaneIntoView(index: number, { align }: { align: 'center' | 'nearest' }) {
    if (!this.props.traceSpec) return;
    const style = this.getStyle();
    const { spans } = this.getPipeline(this.props.traceSpec);
    const { height } = this.props.chartDimensions;
    const plotHeight = height - style.timeBarHeight;
    const maxScroll = computeMaxScroll(spans.length, style.laneHeight, plotHeight);
    this.scrollOffset = computeScrollTarget(index, this.scrollOffset, plotHeight, style.laneHeight, maxScroll, align);
    this.scheduleRender?.();
  }

  /** Announce a lane's span to the aria-live region. Shared by keyboard nav and scrollToSpan. */
  private announceLane(span: NormalizedSpan): void {
    if (this.ariaLiveRef.current) {
      this.ariaLiveRef.current.textContent = `${span.name} — ${formatMs(span.end - span.start)}`;
    }
  }

  /**
   * Spec 14: scroll the lane for span `id` into view (centered), set the focused-lane highlight,
   * and announce via the aria-live region. Does NOT move DOM keyboard focus (no focus-steal).
   * Bound arrow-field so `this.scrollToSpan` is a stable reference to hand to the callback.
   */
  private scrollToSpan = (id: string): void => {
    if (!this.props.traceSpec) return;
    const { spans } = this.getPipeline(this.props.traceSpec); // ensures spanIdToLane is fresh
    const laneIndex = this.spanIdToLane.get(id);
    if (laneIndex === undefined) {
      Logger.warn(`Trace chart scrollToSpan: span id "${id}" not found; ignoring.`);
      return;
    }
    this.scrollLaneIntoView(laneIndex, { align: 'center' });
    this.focusedLaneIndex = laneIndex; // reuse Spec 12 focus highlight; repaint already scheduled
    const span = spans[laneIndex];
    if (span) this.announceLane(span); // a11y parity with keyboard moveFocus
  };

  /**
   * Re-registers the controlProviderCallback when its reference changes (idempotent per ADR 0008).
   * Called from componentDidMount (initial registration) and componentDidUpdate.
   */
  private syncControlProvider(prevSpec: TraceSpec | undefined): void {
    const cb = this.props.traceSpec?.controlProviderCallback;
    if (cb && cb !== prevSpec?.controlProviderCallback) {
      cb({ scrollToSpan: this.scrollToSpan });
    }
  }

  componentDidMount = () => {
    this.mounted = true;
    this.tryCanvasContext();

    // Fit-all snap (zoom=0, NaN tween → one RAF tick, then stops).
    this.resetView();
    // Seed the domain-semantics key so the first componentDidUpdate doesn't spuriously reset.
    this.viewKey = this.props.traceSpec ? this.buildViewKey(this.props.traceSpec) : null;

    // Build the RAF pipeline: withDeltaTime wraps frame for delta-time; we own the rAF id so we
    // can cancel it in componentWillUnmount (withAnimation hides the id with no cancel path).
    const timedRender = withDeltaTime((deltaT: number) => this.frame(deltaT));
    this.scheduleRender = () => {
      if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
      this.rafId = window.requestAnimationFrame(timedRender);
    };

    // Canvas interaction listeners
    this.setupEventHandlers();

    // Chart protocol: fire once on mount (like Timeslip/Flame).
    // Firing in componentDidUpdate creates an infinite update loop (see flame_chart.tsx:451).
    this.props.onChartRendered();
    this.props.onRenderChange(true);

    // Kick the first frame (snaps to fit-all)
    this.scheduleRender();

    // Container-level wheel preventDefault — must use stable reference for removal
    this.props.containerRef().current?.addEventListener('wheel', this.preventScroll, { passive: false });

    // Spec 14: register control callbacks with the caller (initial registration).
    // Must run after setupEventHandlers so scrollToSpan is fully operational.
    this.props.traceSpec?.controlProviderCallback?.({ scrollToSpan: this.scrollToSpan });
  };

  componentWillUnmount() {
    this.mounted = false;
    // Cancel any pending rAF so frame() doesn't fire on a detached canvas post-unmount.
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    // Cancel pending single-click selection commit — prevents setState after unmount.
    if (this.clickTimer !== null) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    this.teardownEventHandlers();
    this.props.containerRef().current?.removeEventListener('wheel', this.preventScroll);
  }

  componentDidUpdate = (prevProps: TraceProps) => {
    if (!this.ctx) this.tryCanvasContext();
    this.syncViewKeyReset(prevProps);     // must run first: resets zoomPan/lastFiredDomain to fit-all when scale changes
    this.syncFocusDomain(prevProps);      // applies controlled focusDomain in the (possibly just-reset) coordinate space
    this.syncPinOnSpecChange(prevProps);
    this.syncSelectionLifecycle(prevProps);
    this.syncControlProvider(prevProps.traceSpec);
    this.redrawIfCanvasPropsChanged(prevProps);
  };

  // Reset the horizontal view when the reference-domain semantics change (xScaleType or format).
  // Rationale: switching e.g. linear ↔ time shifts the domain origin (elapsed zero vs epoch-ms)
  // without changing the extent. domainTween's extent-only completion metric declares "done" on the
  // first frame and strands the view between the old and new origins — the "updates only on hover"
  // creep. A zoom exponent is also meaningless across a reference-domain change.
  // Keying on (xScaleType, format) — not the data ref — preserves zoom across same-scale data
  // refreshes (future streaming concern). See ADR 0004 Decision 2 (addendum).
  private syncViewKeyReset(_prevProps: TraceProps) {
    const spec = this.props.traceSpec;
    if (!spec) return;
    const newKey = this.buildViewKey(spec);
    if (hasViewKeyChanged(this.viewKey, newKey)) {
      this.resetView();
      this.viewKey = newKey;
    }
  }

  // Apply a controlled focusDomain prop, easing the view to the requested window (Spec 16 / ADR 0007).
  // Ordering: must run AFTER syncViewKeyReset so that on a simultaneous scale+focusDomain change the
  // view is reset to fit-all in the new coordinate space BEFORE applying the controlled window.
  //
  // Change detection uses VALUE comparison (fd[0]/fd[1]) not reference, so inline array literals are
  // safe and do not cause yank-back on unrelated re-renders (plan refinement vs spec line 27).
  //
  // Echo-guard: if the incoming value matches lastFiredDomain within epsilon, this is our own
  // emission being fed back by the overview — skip re-arming.
  //
  // Pre-seed: set lastFiredDomain = fd BEFORE easing so the settle does NOT fire the parent's own
  // command back at it as a confirming echo (plan contract 5).
  private syncFocusDomain(prevProps: TraceProps) {
    const spec = this.props.traceSpec;
    const fd = spec?.focusDomain;
    const prev = prevProps.traceSpec?.focusDomain;
    if (!fd) return;
    // Value comparison — guard fd[0]/fd[1] against undefined (no prop) already handled by the !fd guard above.
    if (prev && fd[0] === prev[0] && fd[1] === prev[1]) return;
    // Echo-guard: incoming value matches our own last emission — skip (would cause jitter loop).
    if (!this.focusDomainDiffers(fd, this.lastFiredDomain)) return;
    const { domain } = this.getPipeline(spec);
    // Pre-seed: suppress the confirming echo that would otherwise fire at loop-stop.
    this.lastFiredDomain = fd;
    this.zoomPan.focus = domainToZoomPan(fd, [domain.min, domain.max]);
    this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, computeZoomMax(domain.max - domain.min, minVisibleExtentForScale(spec.xScaleType)));
    this.easeZoom = true;
    this.flywheelActive = false;
    this.scheduleRender?.();
  }

  // Unpin when the spec changes (data or view — stale frozen index may no longer be valid).
  // Only call unpinTooltip when already pinned to avoid an unnecessary setState.
  private syncPinOnSpecChange(prevProps: TraceProps) {
    if (this.pin.pinned && this.props.traceSpec !== prevProps.traceSpec) {
      this.unpinTooltip();
    }
  }

  // Selection lifecycle on data/view changes (ADR 0011 Decision 4 / plan D3).
  private syncSelectionLifecycle(prevProps: TraceProps) {
    const spec = this.props.traceSpec;
    if (!spec) return;

    const viewKeyChanged = hasViewKeyChanged(
      this.viewKey && prevProps.traceSpec ? this.buildViewKey(prevProps.traceSpec) : null,
      this.buildViewKey(spec),
    );
    if (viewKeyChanged) {
      // View-domain semantics changed — stale selection (ADR 0011 mirrors pin reset).
      // Fire onSelectionChange([]) only if selection was non-empty.
      const current = this.getEffectiveSelection();
      if (current.length > 0) {
        this.selection = [];
        this.fireSelectionChange([]);
        this.scheduleRender?.();
      }
    } else if (spec.data !== prevProps.traceSpec?.data) {
      // Data changed: prune stale refs (authoritative — plan D3).
      const current = this.getEffectiveSelection();
      if (current.length > 0) {
        const { spans } = this.getPipeline(spec);
        const pruned = current.filter((ref) => {
          const laneIndex = this.spanIdToLane.get(ref.spanId);
          if (laneIndex === undefined) return false;
          const s = spans[laneIndex];
          if (!s) return false;
          if (ref.region === 'active' && ref.segmentIndex >= s.activeSegments.length) return false;
          // waitingSegments is cheap (inline gap loop) so computing it once to validate is fine.
          if (ref.region === 'waiting' && ref.segmentIndex >= waitingSegments(s).length) return false;
          return true;
        });
        if (pruned.length !== current.length) {
          // In controlled mode: fire only, don't write the field (parent owns the prop).
          if (this.props.traceSpec?.selection === undefined) {
            this.selection = pruned;
          }
          this.fireSelectionChange(pruned);
          this.scheduleRender?.();
        }
      }
    }

    // Echo-guard: if controlled selection prop changed and is set-equal to lastFired, no-op.
    if (
      spec.selection !== undefined &&
      spec.selection !== prevProps.traceSpec?.selection &&
      !selectionSetEqual(spec.selection, this.lastFiredSelection)
    ) {
      this.lastFiredSelection = spec.selection;
      this.scheduleRender?.();
    }
  }

  // Redraw only when a canvas-affecting prop changed. Hover setState()s don't touch these three
  // props, so hover stays a DOM-only tooltip-portal update — no wasted rAF, no flag needed.
  // (Spec 7 draws no canvas hover highlight; if one is added later, trigger its redraw explicitly.)
  private redrawIfCanvasPropsChanged(prevProps: TraceProps) {
    if (
      this.props.traceSpec !== prevProps.traceSpec ||
      this.props.theme !== prevProps.theme ||
      this.props.chartDimensions !== prevProps.chartDimensions
    ) {
      this.scheduleRender?.();
    }
  }

  // -------------------------------------------------------------------------
  // RAF frame — reads this.props/this at call time so redux re-renders are seen
  // -------------------------------------------------------------------------

  private frame = (deltaT: number) => {
    if (!this.mounted) return; // guard against post-unmount rAF callbacks
    if (!this.ctx) return;

    const { traceSpec, chartDimensions: { width, height } } = this.props;
    if (!traceSpec) return;

    const { spans, domain, emptyReason } = this.getPipeline(traceSpec);
    const emptyMessage = emptyReason === 'trace-not-found'
      ? (traceSpec.traceNotFoundMessage ?? `No spans found for trace "${traceSpec.traceId}"`)
      : null;
    const style = this.getStyle();

    // --- Zoom/pan → target focus domain ---
    const target = getFocusDomain(this.zoomPan, domain.min, domain.max);

    // Ease-vs-snap split (see plan: domainTween's extent-only completion metric can't ease a pan)
    let tweenOngoing: boolean;
    if (this.easeZoom) {
      tweenOngoing = domainTween(this.tween, deltaT, target.domainFrom, target.domainTo);
    } else {
      // 1:1 snap: pan tracks the cursor directly
      this.tween.niceDomainMin = target.domainFrom;
      this.tween.niceDomainMax = target.domainTo;
      tweenOngoing = false;
    }

    // Kinetic flywheel coast (horizontal pan only; vertical has no kinetics)
    if (this.flywheelActive) {
      this.flywheelActive = kineticFlywheel(this.zoomPan, width);
      // After the flywheel step, sync the pan tween target (still 1:1 during coast)
      const coastTarget = getFocusDomain(this.zoomPan, domain.min, domain.max);
      this.tween.niceDomainMin = coastTarget.domainFrom;
      this.tween.niceDomainMax = coastTarget.domainTo;
    }

    // Clamp vertical scroll to content height
    this.scrollOffset = Math.min(
      this.scrollOffset,
      computeMaxScroll(spans.length, style.laneHeight, height - style.timeBarHeight),
    );

    // Build geometry and draw (spans are pre-sorted and domain pre-computed — no per-frame sort/reduce)
    const focusDomain = this.tweenDomain;
    const geom = buildGeometry(
      spans,
      { width, height },
      focusDomain,
      this.scrollOffset,
      style,
      traceSpec.xScaleType,
      domain,
      this.focusedLaneIndex,
      this.getEffectiveSelection(),
      this.spanIdToLane,
      emptyMessage,
    );

    // DPR scaling: renderer is dpr-agnostic, caller sets the transform each frame.
    const dpr = window.devicePixelRatio ?? 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas2dRenderer.draw(this.ctx, geom, style);

    // Store for picking in hover/click handlers — single source of truth for the current layout.
    this.hover.lastGeom = geom;

    // Keep the loop alive only while there is work to do; fire the focus-domain callback at settle.
    if (tweenOngoing || this.flywheelActive) {
      this.scheduleRender?.();
    } else {
      this.maybeFireFocusDomainChange(domain.min, domain.max);
    }
  };

  // -------------------------------------------------------------------------
  // Memoized style
  // -------------------------------------------------------------------------

  /** Returns `buildTraceStyle(theme)`, recomputing only when the theme reference changes. */
  private getStyle(): ReturnType<typeof buildTraceStyle> {
    const { theme } = this.props;
    if (!this.styleCache || this.styleCache.theme !== theme) {
      this.styleCache = { theme, style: buildTraceStyle(theme) };
    }
    return this.styleCache.style;
  }

  // -------------------------------------------------------------------------
  // Selection helpers (ADR 0011)
  // -------------------------------------------------------------------------

  /** Returns the controlled prop when present (perform-and-fire model), else the local field. */
  private getEffectiveSelection(): TraceSelection {
    return this.props.traceSpec?.selection ?? this.selection;
  }

  /**
   * Fires `onSelectionChange` with the new selection and its rich details, guarded by the
   * order-insensitive set-equality echo guard (plan D1 / ADR 0011 Decision 2). Updates
   * `lastFiredSelection` **before** invoking the callback so a re-entrant controlled-prop update
   * is recognized as an echo and does not trigger a redundant redraw.
   */
  private fireSelectionChange(next: TraceSelection) {
    if (selectionSetEqual(next, this.lastFiredSelection)) return;
    this.lastFiredSelection = next;
    const spec = this.props.traceSpec;
    if (!spec?.onSelectionChange) return;
    const { spans, domain } = this.getPipeline(spec);
    const details = next
      .map((ref) => {
        const laneIndex = this.spanIdToLane.get(ref.spanId);
        if (laneIndex === undefined) return null;
        const span = spans[laneIndex];
        if (!span) return null;
        return buildTraceSelectionDetail(span, domain.min, ref.region, ref.segmentIndex);
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);
    spec.onSelectionChange(next, details);
  }

  /**
   * Returns `true` when `a` and `prev` differ by more than `FOCUS_DOMAIN_EPSILON` in either the
   * extent ratio or the position relative to the VISIBLE extent (focus-extent-relative, so a
   * half-window pan fires at any zoom depth).
   *
   * `null` prev ⇒ always differs (first fire).
   * Guard: zero `aExtent` ⇒ posRatio = 0 (no division by zero).
   */
  private focusDomainDiffers(a: [number, number], prev: [number, number] | null): boolean {
    if (!prev) return true;
    const aExtent = a[1] - a[0];
    const prevExtent = prev[1] - prev[0];
    const extentRatio = prevExtent > 0 ? Math.abs(1 - aExtent / prevExtent) : 1;
    const posRatio = aExtent > 0 ? Math.abs(a[0] - prev[0]) / aExtent : 0;
    return extentRatio > FOCUS_DOMAIN_EPSILON || posRatio > FOCUS_DOMAIN_EPSILON;
  }

  /**
   * Called at RAF-loop stop. Fires `onFocusDomainChange` with the settled visible window when
   * it differs from `lastFiredDomain` by more than `FOCUS_DOMAIN_EPSILON`. Updates
   * `lastFiredDomain` **before** invoking the callback (re-entrant safety — same pattern as
   * `fireSelectionChange`). All gesture sources (wheel, brush, pan coast) converge here because
   * they all flow through the same `tweenOngoing || flywheelActive` keep-going check in `frame()`.
   */
  private maybeFireFocusDomainChange(refFrom: number, refTo: number) {
    const spec = this.props.traceSpec;
    if (!spec?.onFocusDomainChange) return;
    const { domainFrom, domainTo } = getFocusDomain(this.zoomPan, refFrom, refTo);
    const settled: [number, number] = [domainFrom, domainTo];
    if (!this.focusDomainDiffers(settled, this.lastFiredDomain)) return;
    this.lastFiredDomain = settled;
    spec.onFocusDomainChange(settled);
  }

  // -------------------------------------------------------------------------
  // Memoized data pipeline
  // -------------------------------------------------------------------------

  private getPipeline(spec: TraceSpec): { spans: ReturnType<typeof resolveActive>; domain: { min: number; max: number }; emptyReason?: 'trace-not-found' } {
    const { vizColors } = this.props.theme.colors;
    const cache = this.pipelineCache;
    if (
      cache &&
      cache.dataRef === spec.data &&
      cache.xScaleType === spec.xScaleType &&
      cache.traceId === spec.traceId &&
      cache.colorBy === spec.colorBy &&
      cache.laneOrder === spec.laneOrder &&
      cache.vizColors === vizColors
    ) {
      return cache.result;
    }

    // Recompute: normalize now takes TraceDatum[] directly — OTel data arrives pre-converted by fromOtlp.
    const normalizeResult = normalize(spec.data, spec.xScaleType, spec.traceId, spec.colorBy, vizColors);

    // Order lanes once here (O(N log N) per data/scale change) so buildGeometry doesn't re-order
    // on every rAF frame. buildGeometry's contract requires pre-ordered input.
    const resolved = resolveActive(normalizeResult.spans);
    const spans = orderLanes(resolved, spec.laneOrder ?? 'tree');
    const result = { spans, domain: normalizeResult.domain, emptyReason: normalizeResult.emptyReason };
    this.pipelineCache = {
      dataRef: spec.data,
      xScaleType: spec.xScaleType,
      traceId: spec.traceId,
      colorBy: spec.colorBy,
      laneOrder: spec.laneOrder,
      vizColors,
      result,
    };
    // Rebuild spanIdToLane map on pipeline invalidation (plan D4 — not rebuilt per rAF frame).
    this.spanIdToLane = new Map(spans.map((s, i) => [s.id, i]));
    return result;
  }

  // -------------------------------------------------------------------------
  // Hover / tooltip helpers
  // -------------------------------------------------------------------------

  /** Cursor is `pointer` when over an active or waiting region (inside the span's extent). */
  private getActiveCursor(): CSSProperties['cursor'] {
    if (this.hover.index >= 0 && this.hover.region !== 'empty') return 'pointer';
    return DEFAULT_CSS_CURSOR;
  }

  private rebuildTooltip(span: NormalizedSpan, index: number, domainMin: number, region: HoverRegion, segmentIndex: number) {
    const style = this.getStyle();
    this.hover.tooltipInfo = buildTraceTooltipInfo(span, index, domainMin, region, span.color ?? style.activeSegmentColor, segmentIndex);
  }

  private pinTooltip = (pinned: boolean) => {
    if (!pinned) {
      this.unpinTooltip();
      return;
    }
    this.pin.pinned = true;
    this.pin.x = this.hover.pointerX;
    this.pin.y = this.hover.pointerY;
    this.setState({});
  };

  private unpinTooltip() {
    this.pin.pinned = false;
    this.pin.x = NaN;
    this.pin.y = NaN;
    // Recompute hover from current pointer so the tooltip resumes tracking on unpin.
    this.updateHover(
      this.hover.lastGeom && Number.isFinite(this.hover.pointerX)
        ? pickRegion(this.hover.pointerX, this.hover.pointerY, this.hover.lastGeom)
        : null,
    );
    this.setState({});
  }

  /**
   * Updates hover state, fires `onElement*` callbacks on lane-entry/exit, and schedules a React
   * re-render (DOM-only tooltip portal update; does not trigger a canvas rAF frame — see
   * `componentDidUpdate`).
   *
   * Change-guarded: `setState` is only called when the index or region changed, or while hovering
   * (to reposition the tooltip as the pointer moves). Callbacks fire only on lane entry/exit.
   */
  private updateHover(result: PickResult | null) {
    // While pinned, freeze content and index. zoom/pan/drag still work unobstructed because they
    // don't call setState; only this method does (indirectly via hover setState calls below).
    if (this.pin.pinned) return;
    // While brushing, suppress hover — the rubber-band owns the pointer.
    if (this.brush.active) return;

    const newIndex = result ? result.index : -1;
    const prevIndex = this.hover.index;

    this.hover.index = newIndex;
    this.hover.region = result?.region ?? null;

    if (newIndex !== prevIndex) {
      // Lane changed (enter new lane or leave all lanes)
      if (newIndex >= 0 && this.hover.lastGeom && this.props.traceSpec) {
        const span = this.hover.lastGeom.spans[newIndex];
        if (span) {
          const { domain } = this.getPipeline(this.props.traceSpec);
          this.rebuildTooltip(span, newIndex, domain.min, this.hover.region!, result?.segmentIndex ?? -1);
          this.props.onElementOver([buildTraceEvent(span)]);
        }
      } else {
        this.hover.tooltipInfo = { header: null, values: [] };
        if (prevIndex >= 0) this.props.onElementOut();
      }
      this.setState({});
    } else if (newIndex >= 0) {
      // Same lane — update region (State row) and reposition tooltip with pointer.
      // Also update segmentIndex: the pointer may have crossed into a different active segment.
      if (this.hover.lastGeom && this.props.traceSpec) {
        const span = this.hover.lastGeom.spans[newIndex];
        if (span) {
          const { domain } = this.getPipeline(this.props.traceSpec);
          this.rebuildTooltip(span, newIndex, domain.min, this.hover.region!, result?.segmentIndex ?? -1);
        }
      }
      this.setState({});
    }
  }

  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------

  private setupEventHandlers() {
    const canvas = this.props.forwardStageRef.current;
    if (!canvas) return;

    this.handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Clear stale tooltip during zoom — mirrors Flame's smartDraw hover suppression.
      this.updateHover(null);

      if (!this.props.traceSpec) return;
      const style = this.getStyle();
      const plotLeft = gutterPx(style);
      const plotWidth = this.props.chartDimensions.width - plotLeft;

      this.easeZoom = true;
      doZoomAroundPosition(
        this.zoomPan,
        { innerSize: plotWidth, innerLeading: plotLeft },
        zoomSafePointerX(e),
        (-e.deltaY / plotWidth) * WHEEL_ZOOM_VELOCITY,
        0,
        false,
      );

      // Clamp zoom so the visible extent never drops below the scale-appropriate floor:
      // 1 ms for 'time' (ADR 0004 Decision 3), 1 ns for 'linear' (ADR 0010).
      const { domain } = this.getPipeline(this.props.traceSpec);
      const referenceExtentMs = domain.max - domain.min;
      this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, computeZoomMax(referenceExtentMs, minVisibleExtentForScale(this.props.traceSpec.xScaleType)));

      this.scheduleRender?.();
    };

    this.handleMouseDown = (e: MouseEvent) => {
      const dragMode = this.props.traceSpec?.dragMode ?? 'pan';
      // isBrushMode: XOR — Shift inverts the configured gesture so both dragMode values are
      // reachable from the keyboard. dragMode='pan' default: Shift+drag → brush, plain drag → pan.
      const isBrushMode = (dragMode === 'brush') !== e.shiftKey;
      if (isBrushMode) {
        this.brush.active = true;
        this.brush.start = zoomSafePointerX(e);
        this.brush.end = this.brush.start; // zero-width seed so mouseup no-ops a plain click
        this.flywheelActive = false; // stop any coast before the brush gesture
        this.hover.dragMoved = false;
        if (this.clickTimer !== null) { clearTimeout(this.clickTimer); this.clickTimer = null; }
        if (this.hover.lastGeom) {
          const { plot } = this.hover.lastGeom;
          this.brush.overlay = { x: this.brush.start, width: 0, top: plot.top, height: plot.height };
        }
        this.updateHover(null);
        this.setState({});
        return;
      }
      this.hover.dragMoved = false;
      // Cancel any pending single-click selection commit — a new gesture sequence starts here.
      if (this.clickTimer !== null) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
      this.easeZoom = false;
      this.flywheelActive = false;
      // Clear stale tooltip during drag — mirrors Flame's smartDraw hover suppression.
      this.updateHover(null);
      markDragStartPosition(this.zoomPan, zoomSafePointerX(e));
      this.dragStartY = zoomSafePointerY(e);
      this.dragStartScrollOffset = this.scrollOffset;
    };

    this.handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return; // only while primary button held

      if (this.brush.active) {
        // Update rubber-band extent. Clamp to plot bounds (clamp-and-continue on canvas-leave).
        const geom = this.hover.lastGeom;
        if (geom) {
          const { plot } = geom;
          const x = clamp(zoomSafePointerX(e), plot.left, plot.left + plot.width);
          this.brush.end = x;
          const left = Math.min(this.brush.start, x);
          this.brush.overlay = { x: left, width: Math.abs(this.brush.start - x), top: plot.top, height: plot.height };
        }
        this.hover.dragMoved = true; // suppress the post-drag click
        this.setState({});
        return;
      }

      this.hover.dragMoved = true; // distinguish a genuine click from a pan-then-release

      if (!this.props.traceSpec) return;
      const style = this.getStyle();
      const plotWidth = this.props.chartDimensions.width - gutterPx(style);
      const plotHeight = this.props.chartDimensions.height - style.timeBarHeight;
      const { spans } = this.getPipeline(this.props.traceSpec);

      // Horizontal pan: 1:1 via doPanFromPosition (this projection tracks dragVelocity for coast)
      doPanFromPosition(this.zoomPan, plotWidth, zoomSafePointerX(e));

      // Vertical pan: direct scrollOffset adjustment, clamped (no kinetics)
      const maxScroll = computeMaxScroll(spans.length, style.laneHeight, plotHeight);
      this.scrollOffset = Math.min(
        Math.max(0, this.dragStartScrollOffset - (zoomSafePointerY(e) - this.dragStartY)),
        maxScroll,
      );

      this.scheduleRender?.();
    };

    this.handleMouseUp = () => {
      if (this.brush.active) {
        this.brush.active = false;
        this.brush.overlay = null;
        const geom = this.hover.lastGeom;
        const spec = this.props.traceSpec;
        if (!geom || !spec) { this.setState({}); return; }
        // Use the last clamped brushEnd (set in mousemove). If no mousemove fired (zero-width
        // click), brushEnd === brushStart, giving a zero range → below minExtent → no-op.
        const [from, to] = pixelRangeToDomain(this.brush.start, this.brush.end, geom);
        const minExtent = minVisibleExtentForScale(spec.xScaleType);
        if (to - from < minExtent) { this.setState({}); return; }
        const { domain } = this.getPipeline(spec);
        const clampedFrom = clamp(from, domain.min, domain.max);
        const clampedTo = clamp(to, domain.min, domain.max);
        if (clampedTo - clampedFrom < minExtent) { this.setState({}); return; }
        this.zoomPan.focus = domainToZoomPan([clampedFrom, clampedTo], [domain.min, domain.max]);
        this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, computeZoomMax(domain.max - domain.min, minExtent));
        this.easeZoom = true;
        this.flywheelActive = false;
        this.scheduleRender?.();
        this.setState({});
        return;
      }
      endDrag(this.zoomPan); // copies dragVelocity → flyVelocity
      this.flywheelActive = true; // main frame's kineticFlywheel branch owns the coast
      this.scheduleRender?.();
    };

    // Hover: separate canvas listener, disjoint from the window drag handler above (guarded by buttons).
    this.handleHoverMove = (e: MouseEvent) => {
      if (e.buttons === 1) return; // dragging → window handler owns it
      if (!this.hover.lastGeom) return;
      this.hover.pointerX = zoomSafePointerX(e); // canvas-relative CSS px, DPR-agnostic → matches geom units
      this.hover.pointerY = zoomSafePointerY(e);
      this.updateHover(pickRegion(this.hover.pointerX, this.hover.pointerY, this.hover.lastGeom));
    };

    // Click: only fires for genuine clicks — not for pan-then-release (dragMoved guards this).
    // Guard: while pinned the window 'click' dismiss listener runs first; don't also fire onElementClick.
    this.handleCanvasClick = (e: MouseEvent) => {
      if (this.pin.pinned) return;
      if (this.hover.dragMoved) return;
      if (!this.hover.lastGeom || !this.props.traceSpec) return;

      const result = pickRegion(zoomSafePointerX(e), zoomSafePointerY(e), this.hover.lastGeom);

      // onElementClick fires immediately on every raw click (Spec 7), unchanged.
      if (result && result.index >= 0) {
        const span = this.hover.lastGeom.spans[result.index];
        if (span) this.props.onElementClick([buildTraceEvent(span)]);
      }

      // Schedule single-select commit (~250 ms) so a double-click can cancel it first (ADR 0011 D6).
      // The timer is also cleared in mousedown, so a rapid click-drag never commits a stale selection.
      if (this.clickTimer !== null) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
      const geomSnapshot = this.hover.lastGeom;
      // Capture mode at click time; timer fires ~250 ms later after event is gone.
      const mode = selectionModeFromEvent(e);

      this.clickTimer = setTimeout(() => {
        this.clickTimer = null;
        const isHit = result && result.index >= 0 && result.region !== 'empty';
        const current = this.getEffectiveSelection();
        let next: TraceSelection;
        if (!isHit || !result) {
          // Empty/miss: plain click clears; modifier+miss preserves (native file-manager behaviour, G).
          next = mode === 'replace' ? [] : current;
        } else {
          const span = geomSnapshot.spans[result.index];
          if (!span) { next = mode === 'replace' ? [] : current; }
          else {
            const ref: TraceSegmentRef = {
              spanId: span.id,
              region: result.region as 'active' | 'waiting',
              segmentIndex: result.segmentIndex,
            };
            next = applySelection(current, ref, mode);
          }
        }
        this.selection = next;
        this.fireSelectionChange(next);
        this.scheduleRender?.();
      }, DBLCLICK_DEBOUNCE_MS);
    };

    // Double-click: select whole span. Cancels the pending single-click timer.
    this.handleDblClick = (e: MouseEvent) => {
      if (this.hover.dragMoved) return;
      if (!this.hover.lastGeom || !this.props.traceSpec) return;

      // Cancel the first-click timer — double-click supersedes it.
      if (this.clickTimer !== null) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }

      const result = pickRegion(zoomSafePointerX(e), zoomSafePointerY(e), this.hover.lastGeom);
      if (!result || result.index < 0) return;
      const span = this.hover.lastGeom.spans[result.index];
      if (!span) return;

      const ref: TraceSegmentRef = { spanId: span.id, region: 'span', segmentIndex: -1 };
      const current = this.getEffectiveSelection();
      const next = applySelection(current, ref, selectionModeFromEvent(e));

      // Dev-only: warn when a gesture produces a same-span span+segment overlap (ADR 0011 D2).
      if (process.env.NODE_ENV !== 'production') {
        const hasSegmentRefForSameSpan = next.some(
          (r) => r.spanId === span.id && r.region !== 'span',
        );
        if (hasSegmentRefForSameSpan) {
          // eslint-disable-next-line no-console
          console.warn(
            `[elastic-charts/trace] Selection contains both a span ref and a segment ref for spanId="${span.id}". ` +
            `The segment outline will be suppressed (deduped) in the highlight pass.`,
          );
        }
      }

      this.selection = next;
      this.fireSelectionChange(next);
      this.scheduleRender?.();
    };

    this.handleCanvasLeave = () => {
      this.updateHover(null);
    };

    // Right-click to pin. Mirrors flame_chart.tsx handleContextMenu.
    this.handleContextMenu = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault(); // suppress browser context menu
      if (this.pin.pinned) {
        this.handleUnpinningTooltip?.();
        return;
      }
      if (!this.hover.lastGeom) return;
      const x = zoomSafePointerX(e);
      const y = zoomSafePointerY(e);
      const result = pickRegion(x, y, this.hover.lastGeom);
      // NOP if over empty space (respects showTooltipOverEmpty; match the visible condition in render).
      const overSpan = result && result.index >= 0 &&
        (result.region !== 'empty' || this.props.traceSpec?.showTooltipOverEmpty === true);
      if (!overSpan) return;
      // Update pointer and build content while still unpinned, then pin.
      this.hover.pointerX = x;
      this.hover.pointerY = y;
      this.updateHover(result);
      // Scoped dismiss listeners: added on pin, removed on unpin / unmount.
      window.addEventListener('keyup', this.handleKeyUp!);
      window.addEventListener('click', this.handleUnpinningTooltip!);
      window.addEventListener('visibilitychange', this.handleUnpinningTooltip!);
      this.pinTooltip(true);
    };

    this.handleKeyUp = ({ key }: KeyboardEvent) => {
      if (key !== 'Escape') return;
      window.removeEventListener('keyup', this.handleKeyUp!);
      this.unpinTooltip();
    };

    this.handleUnpinningTooltip = () => {
      window.removeEventListener('keyup', this.handleKeyUp!);
      window.removeEventListener('click', this.handleUnpinningTooltip!);
      window.removeEventListener('visibilitychange', this.handleUnpinningTooltip!);
      this.pinTooltip(false);
    };

    // Keyboard navigation (Spec 12). Bound on the canvas; Tab is NOT prevented (no focus trap).
    this.handleKeyDown = (e: KeyboardEvent) => {
      const geom = this.hover.lastGeom;
      const spec = this.props.traceSpec;

      // Pan (←/→) and zoom (+/-) work regardless of focusedLaneIndex.
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (!spec || !geom) return;
        const { domain } = this.getPipeline(spec);
        const focusDomain = this.tweenDomain;
        const extent = focusDomain.max - focusDomain.min;
        const delta = (e.key === 'ArrowLeft' ? -1 : 1) * extent * KEY_PAN_FRACTION;
        const newFrom = clamp(focusDomain.min + delta, domain.min, domain.max - extent);
        const newTo = newFrom + extent;
        this.zoomPan.focus = domainToZoomPan([newFrom, newTo], [domain.min, domain.max]);
        this.easeZoom = false; // 1:1 snap — domainTween cannot ease a pan (ADR 0004)
        this.scheduleRender?.();
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        if (!spec) return;
        const style = this.getStyle();
        const plotLeft = gutterPx(style);
        const plotWidth = this.props.chartDimensions.width - plotLeft;
        this.easeZoom = true;
        doZoomAroundPosition(
          this.zoomPan,
          { innerSize: plotWidth, innerLeading: plotLeft },
          plotLeft + plotWidth / 2,
          KEY_ZOOM_STEP,
          0,
          false,
        );
        const { domain } = this.getPipeline(spec);
        this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, computeZoomMax(domain.max - domain.min, minVisibleExtentForScale(spec.xScaleType)));
        this.scheduleRender?.();
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        if (!spec) return;
        const style = this.getStyle();
        const plotLeft = gutterPx(style);
        const plotWidth = this.props.chartDimensions.width - plotLeft;
        this.easeZoom = true;
        doZoomAroundPosition(
          this.zoomPan,
          { innerSize: plotWidth, innerLeading: plotLeft },
          plotLeft + plotWidth / 2,
          -KEY_ZOOM_STEP,
          0,
          false,
        );
        this.scheduleRender?.();
        return;
      }

      // Lane-navigation keys require spans to be available.
      if (!geom || geom.spans.length === 0) return;
      const lastIndex = geom.spans.length - 1;

      const moveFocus = (newIndex: number) => {
        this.focusedLaneIndex = newIndex;
        this.scrollLaneIntoView(newIndex, { align: 'nearest' });
        const span = geom.spans[newIndex];
        // textContent assignment is XSS-safe — never innerHTML.
        if (span) this.announceLane(span);
        this.scheduleRender?.();
      };

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const current = this.focusedLaneIndex ?? 0;
        moveFocus(Math.max(0, current - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const current = this.focusedLaneIndex ?? -1;
        moveFocus(Math.min(lastIndex, current + 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        moveFocus(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        moveFocus(lastIndex);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.focusedLaneIndex !== null) {
          const span = geom.spans[this.focusedLaneIndex];
          if (span) {
            this.props.onElementClick([buildTraceEvent(span)]);
            // Keyboard: whole-span selection — plain = replace (aligns spec-13 line 102, G3).
            // Shift = additive, Cmd(Mac)/Ctrl(other) = toggle (G2 normalisation).
            // No clickTimer needed — keyboard has no double-click ambiguity.
            const ref: TraceSegmentRef = { spanId: span.id, region: 'span', segmentIndex: -1 };
            const current = this.getEffectiveSelection();
            const mode = selectionModeFromEvent(e);
            const next = applySelection(current, ref, mode);
            this.selection = next;
            this.fireSelectionChange(next);
            // Announce keyboard-initiated selection via aria-live (G4). Mouse stays silent.
            if (this.ariaLiveRef.current) {
              let utterance: string;
              if (next.length > current.length) {
                utterance = next.length === 1
                  ? `Selected ${span.name}`
                  : `${span.name} added, ${next.length} selected`;
              } else if (next.length < current.length) {
                utterance = `${span.name} removed, ${next.length} selected`;
              } else {
                // additive no-op (Shift on already-selected ref)
                utterance = `${span.name} already selected`;
              }
              this.ariaLiveRef.current.textContent = utterance;
            }
            this.scheduleRender?.();
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.focusedLaneIndex = null;
        this.unpinTooltip(); // idempotent — existing window keyup unpin (Spec 10) is a no-op after this
        // Clear selection on Escape (ADR 0011 / plan step 8).
        const current = this.getEffectiveSelection();
        if (current.length > 0) {
          this.selection = [];
          this.fireSelectionChange([]);
          // Announce keyboard-initiated selection clear via aria-live (G4).
          if (this.ariaLiveRef.current) {
            this.ariaLiveRef.current.textContent = 'Selection cleared';
          }
        }
        this.scheduleRender?.();
      }
    };

    // Focus: show the keyboard badge. Only triggers a re-render (badge is a DOM sibling of the canvas,
    // not drawn on the canvas itself, so no scheduleRender needed).
    this.handleFocus = () => {
      if (!this.hasFocus) {
        this.hasFocus = true;
        this.setState({});
      }
    };

    this.handleBlur = () => {
      this.hasFocus = false;
      if (this.focusedLaneIndex !== null) {
        this.focusedLaneIndex = null;
        this.scheduleRender?.();
      } else {
        this.setState({});
      }
    };

    canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleHoverMove);
    canvas.addEventListener('click', this.handleCanvasClick);
    canvas.addEventListener('dblclick', this.handleDblClick);
    canvas.addEventListener('mouseleave', this.handleCanvasLeave);
    canvas.addEventListener('contextmenu', this.handleContextMenu);
    canvas.addEventListener('keydown', this.handleKeyDown);
    canvas.addEventListener('focus', this.handleFocus);
    canvas.addEventListener('blur', this.handleBlur);
    // mousemove and mouseup are bound to window so a fast flick that releases the pointer outside
    // the canvas still fires endDrag and triggers the kinetic flywheel coast. Mirrors Timeslip.
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  private teardownEventHandlers() {
    const canvas = this.props.forwardStageRef.current;
    if (!canvas) return;

    if (this.handleWheel) canvas.removeEventListener('wheel', this.handleWheel);
    if (this.handleMouseDown) canvas.removeEventListener('mousedown', this.handleMouseDown);
    if (this.handleHoverMove) canvas.removeEventListener('mousemove', this.handleHoverMove);
    if (this.handleCanvasClick) canvas.removeEventListener('click', this.handleCanvasClick);
    if (this.handleDblClick) canvas.removeEventListener('dblclick', this.handleDblClick);
    if (this.handleCanvasLeave) canvas.removeEventListener('mouseleave', this.handleCanvasLeave);
    if (this.handleContextMenu) canvas.removeEventListener('contextmenu', this.handleContextMenu);
    if (this.handleKeyDown) canvas.removeEventListener('keydown', this.handleKeyDown);
    if (this.handleFocus) canvas.removeEventListener('focus', this.handleFocus);
    if (this.handleBlur) canvas.removeEventListener('blur', this.handleBlur);
    if (this.handleMouseMove) window.removeEventListener('mousemove', this.handleMouseMove);
    if (this.handleMouseUp) window.removeEventListener('mouseup', this.handleMouseUp);
    // Defensive: remove pin dismiss listeners in case the component unmounts while pinned.
    if (this.handleKeyUp) window.removeEventListener('keyup', this.handleKeyUp);
    if (this.handleUnpinningTooltip) {
      window.removeEventListener('click', this.handleUnpinningTooltip);
      window.removeEventListener('visibilitychange', this.handleUnpinningTooltip);
    }
  }

  // -------------------------------------------------------------------------
  // Canvas context helpers
  // -------------------------------------------------------------------------

  private tryCanvasContext = () => {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  render = () => {
    const {
      forwardStageRef,
      chartDimensions: { width, height },
      a11ySettings,
      tooltipRequired,
      containerRef,
    } = this.props;
    const canvasStyle: CSSProperties = {
      width,
      height,
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      border: 0,
      position: 'absolute',
      cursor: this.getActiveCursor(),
      touchAction: 'none',
      outline: 'none',
    };
    const dpr = window.devicePixelRatio ?? 1;
    const tooltipPosition = this.pin.pinned
      ? { x: this.pin.x, y: this.pin.y, width: 0, height: 0 }
      : { x: this.hover.pointerX, y: this.hover.pointerY, width: 0, height: 0 };
    const tooltipVisible =
      this.pin.pinned ||
      (tooltipRequired && this.hover.index >= 0 && (this.hover.region !== 'empty' || this.props.traceSpec?.showTooltipOverEmpty === true));

    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          {/* ScreenReaderSummary and ScreenReaderTraceTable are siblings of the canvas inside
              the <figure> so AT can browse them with the virtual cursor. They must NOT be
              descendants of the canvas (role="application" subtree is not browsable). */}
          <ScreenReaderSummary />
          <ScreenReaderTraceTable />
          <AriaLiveRegion ref={this.ariaLiveRef} />
          <canvas
            ref={forwardStageRef}
            tabIndex={0}
            className="echCanvasRenderer"
            width={width * dpr}
            height={height * dpr}
            style={canvasStyle}
            role="application"
          />
          <KeyboardFocusBadge visible={this.hasFocus && this.props.traceSpec?.showKeyboardFocusBadge !== false} />
        </figure>
        {this.brush.overlay && <BrushOverlay overlay={this.brush.overlay} brushTheme={this.props.theme.brush} />}
        {/* BasicTooltip is connect()-ed; it auto-reads `settings.customTooltip` from redux, so
            <Tooltip customTooltip> override is free. Pin state is self-managed (Spec 10). */}
        <BasicTooltip
          onPointerMove={NOOP}
          position={tooltipPosition}
          pinned={this.pin.pinned}
          selected={EMPTY}
          canPinTooltip={tooltipRequired}
          pinTooltip={this.pinTooltip}
          toggleSelectedTooltipItem={NOOP}
          setSelectedTooltipItems={NOOP}
          visible={tooltipVisible}
          info={this.hover.tooltipInfo}
          getChartContainerRef={containerRef}
        />
      </>
    );
  };
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const traceSpec = getSpecsFromStore<TraceSpec>(state.specs, ChartType.Trace, SpecType.Series)[0];
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    traceSpec,
    theme: getChartThemeSelector(state),
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    tooltipRequired: getTooltipSpecSelector(state).type !== TooltipType.None,

    // mandatory charts API protocol; todo extract these mappings once there are other charts like Trace
    onElementOver: settingsSpec.onElementOver ?? (() => {}),
    onElementClick: settingsSpec.onElementClick ?? (() => {}),
    onElementOut: settingsSpec.onElementOut ?? (() => {}),
    onRenderChange: settingsSpec.onRenderChange ?? (() => {}), // todo eventually also update data props on a local .echChartStatus element: data-ech-render-complete={rendered} data-ech-render-count={renderedCount} data-ech-debug-state={debugStateString}
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const TraceChartLayers = connect(mapStateToProps, mapDispatchToProps)(TraceComponent);

/** @internal */
export const chartRenderer: ChartRenderer = (
  containerRef: BackwardRef,
  forwardStageRef: RefObject<HTMLCanvasElement>,
) => <TraceChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />;
