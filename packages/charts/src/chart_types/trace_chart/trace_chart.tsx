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
import { resolveActive } from './data/self_time';
import type { NormalizedSpan } from './data/types';
import { canvas2dRenderer, pickRegion } from './render/canvas2d_renderer';
import { buildGeometry } from './render/geometry';
import type { ViewKey } from './render/interaction';
import { computeMaxScroll, computeZoomMax, hasViewKeyChanged } from './render/interaction';
import { buildTraceEvent, buildTraceTooltipInfo } from './render/tooltip';
import type { HoverRegion, PickResult, TraceGeometry } from './render/types';
import { buildTraceStyle } from './theme';
import type { TraceSpec } from './trace_api';
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
import type { TooltipInfo } from '../../components/tooltip/types';
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
  vizColors: Theme['colors']['vizColors'];
  result: { spans: ReturnType<typeof resolveActive>; domain: { min: number; max: number } };
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
  // lastGeom is written once per frame; all hover handlers read it for picking without rebuilding geometry.
  private lastGeom: TraceGeometry | null = null;
  private hoverIndex = -1;         // -1 = no hover; matches pickLane/pickRegion sentinel
  private hoverRegion: HoverRegion | null = null;
  private pointerX = NaN;
  private pointerY = NaN;
  private tooltipInfo: TooltipInfo = { header: null, values: [] };
  private dragMoved = false;       // distinguishes a genuine click from a pan-then-release
  private handleHoverMove: ((e: MouseEvent) => void) | null = null;
  private handleCanvasClick: ((e: MouseEvent) => void) | null = null;
  private handleCanvasLeave: (() => void) | null = null;

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
  }

  componentDidMount = () => {
    this.mounted = true;
    this.tryCanvasContext();

    // Fit-all snap (zoom=0, NaN tween → one RAF tick, then stops).
    this.resetView();
    // Seed the domain-semantics key so the first componentDidUpdate doesn't spuriously reset.
    this.viewKey = this.props.traceSpec
      ? { xScaleType: this.props.traceSpec.xScaleType, format: 'simple', traceId: this.props.traceSpec.traceId }
      : null;

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
  };

  componentWillUnmount() {
    this.mounted = false;
    // Cancel any pending rAF so frame() doesn't fire on a detached canvas post-unmount.
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.teardownEventHandlers();
    this.props.containerRef().current?.removeEventListener('wheel', this.preventScroll);
  }

  componentDidUpdate = (prevProps: TraceProps) => {
    if (!this.ctx) this.tryCanvasContext();

    // Reset the horizontal view when the reference-domain semantics change (xScaleType or format).
    // Rationale: switching e.g. linear ↔ time shifts the domain origin (elapsed zero vs epoch-ms)
    // without changing the extent. domainTween's extent-only completion metric declares "done" on the
    // first frame and strands the view between the old and new origins — the "updates only on hover"
    // creep. A zoom exponent is also meaningless across a reference-domain change.
    // Keying on (xScaleType, format) — not the data ref — preserves zoom across same-scale data
    // refreshes (future streaming concern). See ADR 0004 Decision 2 (addendum).
    const spec = this.props.traceSpec;
    if (spec && hasViewKeyChanged(this.viewKey, { xScaleType: spec.xScaleType, format: 'simple', traceId: spec.traceId })) {
      this.resetView();
      this.viewKey = { xScaleType: spec.xScaleType, format: 'simple', traceId: spec.traceId };
    }

    // Redraw only when a canvas-affecting prop changed. Hover setState()s don't touch these three
    // props, so hover stays a DOM-only tooltip-portal update — no wasted rAF, no flag needed.
    // (Spec 7 draws no canvas hover highlight; if one is added later, trigger its redraw explicitly.)
    if (
      this.props.traceSpec !== prevProps.traceSpec ||
      this.props.theme !== prevProps.theme ||
      this.props.chartDimensions !== prevProps.chartDimensions
    ) {
      this.scheduleRender?.();
    }
  };

  // -------------------------------------------------------------------------
  // RAF frame — reads this.props/this at call time so redux re-renders are seen
  // -------------------------------------------------------------------------

  private frame = (deltaT: number) => {
    if (!this.mounted) return; // guard against post-unmount rAF callbacks
    if (!this.ctx) return;

    const { traceSpec, chartDimensions: { width, height } } = this.props;
    if (!traceSpec) return;

    const { spans, domain } = this.getPipeline(traceSpec);
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
    const focusDomain = { min: this.tween.niceDomainMin, max: this.tween.niceDomainMax };
    const geom = buildGeometry(
      spans,
      { width, height },
      focusDomain,
      this.scrollOffset,
      style,
      traceSpec.xScaleType,
      domain,
    );

    // DPR scaling: renderer is dpr-agnostic, caller sets the transform each frame.
    const dpr = window.devicePixelRatio ?? 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas2dRenderer.draw(this.ctx, geom, style);

    // Store for picking in hover/click handlers — single source of truth for the current layout.
    this.lastGeom = geom;

    // Keep the loop alive only while there is work to do
    if (tweenOngoing || this.flywheelActive) {
      this.scheduleRender?.();
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
  // Memoized data pipeline
  // -------------------------------------------------------------------------

  private getPipeline(spec: TraceSpec): { spans: ReturnType<typeof resolveActive>; domain: { min: number; max: number } } {
    const { vizColors } = this.props.theme.colors;
    const cache = this.pipelineCache;
    if (
      cache &&
      cache.dataRef === spec.data &&
      cache.xScaleType === spec.xScaleType &&
      cache.traceId === spec.traceId &&
      cache.colorBy === spec.colorBy &&
      cache.vizColors === vizColors
    ) {
      return cache.result;
    }

    // Recompute: normalize now takes TraceDatum[] directly — OTel data arrives pre-converted by fromOtlp.
    const normalizeResult = normalize(spec.data, spec.xScaleType, spec.traceId, spec.colorBy, vizColors);

    // Sort once here (O(N log N) per data/scale change) so buildGeometry doesn't re-sort
    // on every rAF frame. buildGeometry's contract requires pre-sorted input.
    const resolved = resolveActive(normalizeResult.spans);
    const spans = resolved.slice().sort((a, b) => a.start - b.start);
    const result = { spans, domain: normalizeResult.domain };
    this.pipelineCache = {
      dataRef: spec.data,
      xScaleType: spec.xScaleType,
      traceId: spec.traceId,
      colorBy: spec.colorBy,
      vizColors,
      result,
    };
    return result;
  }

  // -------------------------------------------------------------------------
  // Hover / tooltip helpers
  // -------------------------------------------------------------------------

  /** Cursor is `pointer` when over an active or waiting region (inside the span's extent). */
  private getActiveCursor(): CSSProperties['cursor'] {
    if (this.hoverIndex >= 0 && this.hoverRegion !== 'empty') return 'pointer';
    return DEFAULT_CSS_CURSOR;
  }

  private rebuildTooltip(span: NormalizedSpan, index: number, domainMin: number, region: HoverRegion, segmentIndex: number) {
    const style = this.getStyle();
    this.tooltipInfo = buildTraceTooltipInfo(span, index, domainMin, region, span.color ?? style.activeSegmentColor, segmentIndex);
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
    const newIndex = result ? result.index : -1;
    const prevIndex = this.hoverIndex;

    this.hoverIndex = newIndex;
    this.hoverRegion = result?.region ?? null;

    if (newIndex !== prevIndex) {
      // Lane changed (enter new lane or leave all lanes)
      if (newIndex >= 0 && this.lastGeom && this.props.traceSpec) {
        const span = this.lastGeom.spans[newIndex];
        if (span) {
          const { domain } = this.getPipeline(this.props.traceSpec);
          this.rebuildTooltip(span, newIndex, domain.min, this.hoverRegion!, result?.segmentIndex ?? -1);
          this.props.onElementOver([buildTraceEvent(span)]);
        }
      } else {
        this.tooltipInfo = { header: null, values: [] };
        if (prevIndex >= 0) this.props.onElementOut();
      }
      this.setState({});
    } else if (newIndex >= 0) {
      // Same lane — update region (State row) and reposition tooltip with pointer.
      // Also update segmentIndex: the pointer may have crossed into a different active segment.
      if (this.lastGeom && this.props.traceSpec) {
        const span = this.lastGeom.spans[newIndex];
        if (span) {
          const { domain } = this.getPipeline(this.props.traceSpec);
          this.rebuildTooltip(span, newIndex, domain.min, this.hoverRegion!, result?.segmentIndex ?? -1);
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
      const plotWidth = this.props.chartDimensions.width - style.gutterWidth;
      const plotLeft = style.gutterWidth;

      this.easeZoom = true;
      doZoomAroundPosition(
        this.zoomPan,
        { innerSize: plotWidth, innerLeading: plotLeft },
        zoomSafePointerX(e),
        (-e.deltaY / plotWidth) * WHEEL_ZOOM_VELOCITY,
        0,
        false,
      );

      // Clamp zoom so the visible extent never drops below MIN_VISIBLE_EXTENT_MS (1 ms) — the
      // finest granularity the time-raster engine can label. See ADR 0004 Decision 3.
      const { domain } = this.getPipeline(this.props.traceSpec);
      const referenceExtentMs = domain.max - domain.min;
      this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, computeZoomMax(referenceExtentMs));

      this.scheduleRender?.();
    };

    this.handleMouseDown = (e: MouseEvent) => {
      this.dragMoved = false;
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
      this.dragMoved = true; // distinguish a genuine click from a pan-then-release

      if (!this.props.traceSpec) return;
      const style = this.getStyle();
      const plotWidth = this.props.chartDimensions.width - style.gutterWidth;
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
      endDrag(this.zoomPan); // copies dragVelocity → flyVelocity
      this.flywheelActive = true; // main frame's kineticFlywheel branch owns the coast
      this.scheduleRender?.();
    };

    // Hover: separate canvas listener, disjoint from the window drag handler above (guarded by buttons).
    this.handleHoverMove = (e: MouseEvent) => {
      if (e.buttons === 1) return; // dragging → window handler owns it
      if (!this.lastGeom) return;
      this.pointerX = zoomSafePointerX(e); // canvas-relative CSS px, DPR-agnostic → matches geom units
      this.pointerY = zoomSafePointerY(e);
      this.updateHover(pickRegion(this.pointerX, this.pointerY, this.lastGeom));
    };

    // Click: only fires for genuine clicks — not for pan-then-release (dragMoved guards this).
    this.handleCanvasClick = (e: MouseEvent) => {
      if (this.dragMoved) return;
      if (!this.lastGeom || !this.props.traceSpec) return;
      const result = pickRegion(zoomSafePointerX(e), zoomSafePointerY(e), this.lastGeom);
      if (result && result.index >= 0) {
        const span = this.lastGeom.spans[result.index];
        if (span) this.props.onElementClick([buildTraceEvent(span)]);
      }
    };

    this.handleCanvasLeave = () => {
      this.updateHover(null);
    };

    canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleHoverMove);
    canvas.addEventListener('click', this.handleCanvasClick);
    canvas.addEventListener('mouseleave', this.handleCanvasLeave);
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
    if (this.handleCanvasLeave) canvas.removeEventListener('mouseleave', this.handleCanvasLeave);
    if (this.handleMouseMove) window.removeEventListener('mousemove', this.handleMouseMove);
    if (this.handleMouseUp) window.removeEventListener('mouseup', this.handleMouseUp);
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
    const style: CSSProperties = {
      width,
      height,
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      border: 0,
      position: 'absolute',
      // Inline cursor: 'pointer' over active/waiting regions; default over empty or gutter.
      // Canvas sits on top and receives the pointer, so this wins over the container-level cursor.
      cursor: this.getActiveCursor(),
      touchAction: 'none',
    };

    const dpr = window.devicePixelRatio ?? 1;
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          <canvas /* Canvas2d layer */
            ref={forwardStageRef}
            tabIndex={0}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            style={{ ...style, outline: 'none' }}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
        </figure>
        {/* BasicTooltip is connect()-ed; it auto-reads `settings.customTooltip` from redux, so
            <Tooltip customTooltip> override is free. No pinning machinery needed for Spec 7. */}
        <BasicTooltip
          onPointerMove={() => {}}
          position={{ x: this.pointerX, y: this.pointerY, width: 0, height: 0 }}
          pinned={false}
          selected={[]}
          canPinTooltip={false}
          pinTooltip={() => {}}
          toggleSelectedTooltipItem={() => {}}
          setSelectedTooltipItems={() => {}}
          visible={tooltipRequired && this.hoverIndex >= 0 && (this.hoverRegion !== 'empty' || this.props.traceSpec?.showTooltipOverEmpty === true)}
          info={this.tooltipInfo}
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
