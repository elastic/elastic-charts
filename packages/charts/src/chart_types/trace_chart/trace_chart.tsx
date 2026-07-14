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
import type { OtelInput } from './data/types';
import { resolveActive } from './data/self_time';
import { canvas2dRenderer } from './render/canvas2d_renderer';
import { buildGeometry } from './render/geometry';
import { buildTraceStyle } from './theme';
import type { TraceDatum, TraceSpec } from './trace_api';
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
import { withAnimation, withDeltaTime } from '../timeslip/utils/animation';
import { zoomSafePointerX, zoomSafePointerY } from '../timeslip/utils/dom';
import {
  initialZoomPan,
  doZoomAroundPosition,
  doPanFromPosition,
  markDragStartPosition,
  endDrag,
  kineticFlywheel,
  getFocusDomain,
  multiplierToZoom,
} from '../timeslip/projections/zoom_pan';
import type { ZoomPan } from '../timeslip/projections/zoom_pan';
import { domainTween } from '../timeslip/projections/domain_tween';

/**
 * Wheel zoom velocity: maps normalized wheel distance (deltaY/plotWidth) to zoom change.
 * Same order of magnitude as Timeslip's wheel handler.
 */
const WHEEL_ZOOM_VELOCITY = 3;

/**
 * Minimum visible time window in ms — the finest granularity the time-raster engine can label.
 * Below 1 ms the millisecond raster keeps emitting bins but labels repeat (e.g. "0ms … 0ms …").
 * Both `linear` and `time` xScaleType traces store domain values in ms, so this constant applies
 * to both. The clamp is local to the trace chart's wheel handler so the shared Timeslip
 * `ZOOM_MAX = 35` in zoom_pan.ts is not changed (different semantics, different consumers).
 * See ADR 0004 Decision 3.
 */
const MIN_VISIBLE_EXTENT_MS = 1;

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

/** Memoized normalize→resolveActive output. Keyed on (data ref, format, xScaleType). */
interface PipelineCache {
  dataRef: TraceDatum[];
  format: string;
  xScaleType: string;
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

  // RAF loop handle — built in componentDidMount; withAnimation manages rAF internally
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

  /**
   * Identifies the reference-domain semantics in effect. Compared on each componentDidUpdate;
   * when it changes the horizontal view resets to fit-all. Preserves zoom across same-scale
   * data refreshes (data-ref changes do not reset the view).
   */
  private viewKey: { xScaleType: string; format: string } | null = null;

  // Stable bound method for the container-level wheel preventDefault (fixes the Spec 0 closure leak)
  private preventScroll = (e: WheelEvent) => e.preventDefault();

  // Bound canvas event handlers — stored for removal in componentWillUnmount
  private handleWheel: ((e: WheelEvent) => void) | null = null;
  private handleMouseDown: ((e: MouseEvent) => void) | null = null;
  private handleMouseMove: ((e: MouseEvent) => void) | null = null;
  private handleMouseUp: ((e: MouseEvent) => void) | null = null;

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
    this.tryCanvasContext();

    // Fit-all snap (zoom=0, NaN tween → one RAF tick, then stops).
    this.resetView();
    // Seed the domain-semantics key so the first componentDidUpdate doesn't spuriously reset.
    this.viewKey = this.props.traceSpec
      ? { xScaleType: this.props.traceSpec.xScaleType, format: this.props.traceSpec.format }
      : null;

    // Build the RAF pipeline: withDeltaTime wraps frame; withAnimation cancels+requests rAF.
    const timedRender = withDeltaTime((deltaT: number) => this.frame(deltaT));
    this.scheduleRender = withAnimation(timedRender);

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
    this.teardownEventHandlers();
    this.props.containerRef().current?.removeEventListener('wheel', this.preventScroll);
    // withAnimation cancels on next call; we don't hold the rAF id directly — that's fine since
    // after unmount no more frames are scheduled and the canvas is gone.
  }

  componentDidUpdate = () => {
    if (!this.ctx) this.tryCanvasContext();

    // Reset the horizontal view when the reference-domain semantics change (xScaleType or format).
    // Rationale: switching e.g. linear ↔ time shifts the domain origin (elapsed zero vs epoch-ms)
    // without changing the extent. domainTween's extent-only completion metric declares "done" on the
    // first frame and strands the view between the old and new origins — the "updates only on hover"
    // creep. A zoom exponent is also meaningless across a reference-domain change.
    // Keying on (xScaleType, format) — not the data ref — preserves zoom across same-scale data
    // refreshes (future streaming concern). See ADR 0004 Decision 2 (addendum).
    const spec = this.props.traceSpec;
    if (
      spec &&
      (!this.viewKey ||
        this.viewKey.xScaleType !== spec.xScaleType ||
        this.viewKey.format !== spec.format)
    ) {
      this.resetView();
      this.viewKey = { xScaleType: spec.xScaleType, format: spec.format };
    }

    // Re-render on prop change (dimensions, theme, new spec data)
    this.scheduleRender?.();
  };

  // -------------------------------------------------------------------------
  // RAF frame — reads this.props/this at call time so redux re-renders are seen
  // -------------------------------------------------------------------------

  private frame = (deltaT: number) => {
    if (!this.ctx) return;

    const { traceSpec, chartDimensions: { width, height }, theme } = this.props;
    if (!traceSpec) return;

    const { spans, domain } = this.getPipeline(traceSpec);
    const style = buildTraceStyle(theme);

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
    const maxScroll = Math.max(0, spans.length * style.laneHeight - (height - style.timeBarHeight));
    this.scrollOffset = Math.min(this.scrollOffset, maxScroll);

    // Build geometry and draw
    const focusDomain = { min: this.tween.niceDomainMin, max: this.tween.niceDomainMax };
    const geom = buildGeometry(spans, { width, height }, focusDomain, this.scrollOffset, style, traceSpec.xScaleType);

    // DPR scaling: renderer is dpr-agnostic, caller sets the transform each frame.
    const dpr = window.devicePixelRatio;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas2dRenderer.draw(this.ctx, geom, style);

    // Keep the loop alive only while there is work to do
    if (tweenOngoing || this.flywheelActive) {
      this.scheduleRender?.();
    }
  };

  // -------------------------------------------------------------------------
  // Memoized data pipeline
  // -------------------------------------------------------------------------

  private getPipeline(spec: TraceSpec): { spans: ReturnType<typeof resolveActive>; domain: { min: number; max: number } } {
    const cache = this.pipelineCache;
    if (
      cache &&
      cache.dataRef === spec.data &&
      cache.format === spec.format &&
      cache.xScaleType === spec.xScaleType
    ) {
      return cache.result;
    }

    // Recompute: format is part of the key because it selects the normalize branch.
    // The 'otel' branch expects OtelInput; spec.data is typed TraceDatum[] in the public API even for
    // otel (the correlated union lives inside normalize). The cast is safe when format='otel' and is
    // localized here rather than widening the public TraceSpec type — proper fix is a Spec 1/API follow-up.
    const normalizeResult =
      spec.format === 'simple'
        ? normalize(spec.data, 'simple', spec.xScaleType)
        : normalize(spec.data as unknown as OtelInput, 'otel', spec.xScaleType);

    const spans = resolveActive(normalizeResult.spans);
    const result = { spans, domain: normalizeResult.domain };
    this.pipelineCache = { dataRef: spec.data, format: spec.format, xScaleType: spec.xScaleType, result };
    return result;
  }

  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------

  private setupEventHandlers() {
    const canvas = this.props.forwardStageRef.current;
    if (!canvas) return;

    this.handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!this.props.traceSpec) return;
      const style = buildTraceStyle(this.props.theme);
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

      // Clamp zoom so the visible extent never drops below the finest time-raster interval (1 ms).
      // Below this floor the millisecond raster repeats identical labels. Uses multiplierToZoom from
      // the shared projection to compute the zoom level at which extent === MIN_VISIBLE_EXTENT_MS.
      // The clamp sits here (not in zoom_pan.ts ZOOM_MAX) because it is domain-aware and
      // trace-specific — Timeslip has different semantics and must not be constrained this way.
      const { domain } = this.getPipeline(this.props.traceSpec);
      const referenceExtentMs = domain.max - domain.min;
      if (referenceExtentMs > MIN_VISIBLE_EXTENT_MS) {
        const zoomMax = multiplierToZoom(MIN_VISIBLE_EXTENT_MS / referenceExtentMs);
        this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, zoomMax);
      } else {
        // Reference domain is already ≤ 1 ms: fit-all is the deepest meaningful view.
        this.zoomPan.focus.zoom = 0;
      }

      this.scheduleRender?.();
    };

    this.handleMouseDown = (e: MouseEvent) => {
      this.easeZoom = false;
      this.flywheelActive = false;
      markDragStartPosition(this.zoomPan, zoomSafePointerX(e));
      this.dragStartY = zoomSafePointerY(e);
      this.dragStartScrollOffset = this.scrollOffset;
    };

    this.handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return; // only while primary button held

      if (!this.props.traceSpec) return;
      const style = buildTraceStyle(this.props.theme);
      const plotWidth = this.props.chartDimensions.width - style.gutterWidth;
      const plotHeight = this.props.chartDimensions.height - style.timeBarHeight;
      const { spans } = this.getPipeline(this.props.traceSpec);

      // Horizontal pan: 1:1 via doPanFromPosition (this projection tracks dragVelocity for coast)
      doPanFromPosition(this.zoomPan, plotWidth, zoomSafePointerX(e));

      // Vertical pan: direct scrollOffset adjustment, clamped (no kinetics)
      const maxScroll = Math.max(0, spans.length * style.laneHeight - plotHeight);
      this.scrollOffset = Math.min(
        Math.max(0, this.dragStartScrollOffset - (zoomSafePointerY(e) - this.dragStartY)),
        maxScroll,
      );

      this.scheduleRender?.();
    };

    this.handleMouseUp = (_e: MouseEvent) => {
      endDrag(this.zoomPan); // copies dragVelocity → flyVelocity
      this.flywheelActive = true; // main frame's kineticFlywheel branch owns the coast
      this.scheduleRender?.();
    };

    canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  private teardownEventHandlers() {
    const canvas = this.props.forwardStageRef.current;
    if (!canvas) return;

    if (this.handleWheel) canvas.removeEventListener('wheel', this.handleWheel);
    if (this.handleMouseDown) canvas.removeEventListener('mousedown', this.handleMouseDown);
    if (this.handleMouseMove) canvas.removeEventListener('mousemove', this.handleMouseMove);
    if (this.handleMouseUp) canvas.removeEventListener('mouseup', this.handleMouseUp);
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
      cursor: DEFAULT_CSS_CURSOR,
      touchAction: 'none',
    };

    const dpr = window.devicePixelRatio;
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
