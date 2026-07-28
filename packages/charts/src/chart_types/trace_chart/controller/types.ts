/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';

import type { ResolvedTraceAnnotation } from '../data/annotations';
import type { TraceDataDiagnostics } from '../data/diagnostics';
import type { resolveActive } from '../data/self_time';
import type { NormalizedSpan } from '../data/types';
import type { TraceAnnotationSpec, TraceSpec } from '../trace_api';
import type { SettingsSpec } from '../../../specs';
import type { onChartRendered } from '../../../state/actions/chart';
import type { setTraceUncontrolledCollapsed } from '../../../state/actions/trace';
import type { BackwardRef } from '../../../state/internal_chart_renderer';
import type { getA11ySettingsSelector } from '../../../state/selectors/get_accessibility_config';
import type { Size } from '../../../utils/dimensions';
import type { Theme } from '../../../utils/themes/theme';

/** @internal */
export interface StateProps {
  traceSpec: TraceSpec | undefined;
  annotationSpecs: TraceAnnotationSpec[];
  theme: Theme;
  chartDimensions: Size;
  a11ySettings: ReturnType<typeof getA11ySettingsSelector>;
  tooltipRequired: boolean;
  onElementOver: NonNullable<SettingsSpec['onElementOver']>;
  onElementClick: NonNullable<SettingsSpec['onElementClick']>;
  onElementOut: NonNullable<SettingsSpec['onElementOut']>;
  onRenderChange: NonNullable<SettingsSpec['onRenderChange']>;
}

/** @internal */
export interface DispatchProps {
  onChartRendered: typeof onChartRendered;
  setTraceUncontrolledCollapsed: typeof setTraceUncontrolledCollapsed;
}

/** @internal */
export interface OwnProps {
  containerRef: BackwardRef;
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

/** @internal */
export type TraceProps = StateProps & DispatchProps & OwnProps;

/**
 * Host-supplied bridge the {@link TraceCanvasController} uses to reach the React component without
 * depending on React. `getProps` is read live at frame/handler call time so redux re-renders are
 * seen without an extra selector subscription (ADR 0004 Decision 1/5).
 * @internal
 */
export interface TraceControllerDeps {
  /** Live component props — read at call time, never snapshotted. */
  getProps: () => TraceProps;
  /** The stage `<canvas>` element (or null before mount). */
  getCanvas: () => HTMLCanvasElement | null;
  /** The chart container element used for the container-level wheel `preventDefault`. */
  getContainer: () => HTMLElement | null;
  /** The visually-hidden aria-live div used for screen-reader announcements. */
  getAriaLive: () => HTMLDivElement | null;
  /** Triggers a React re-render of the host component (replaces the old `setState({})`). */
  requestRender: () => void;
}

/** Memoized normalize→resolveActive output. Keyed on (data ref, xScaleType, traceId, colorBy ref, vizColors ref, criticalPath ref, badgeAccessor ref). */
export interface PipelineCache {
  dataRef: TraceSpec['data'];
  xScaleType: string;
  traceId: string | undefined;
  colorBy: TraceSpec['colorBy'];
  laneOrder: TraceSpec['laneOrder'];
  vizColors: Theme['colors']['vizColors'];
  criticalPath: TraceSpec['criticalPath'];
  badgeAccessor: TraceSpec['badgeAccessor'];
  result: {
    spans: ReturnType<typeof resolveActive>;
    depthBySpan: Map<ReturnType<typeof resolveActive>[number], number>;
    hasParents: boolean;
    maxDepth: number;
    domain: { min: number; max: number };
    projectionOffset: number;
    emptyReason?: 'trace-not-found';
    criticalIntervals: Array<{ spanId: string; start: number; end: number }>;
    diagnostics: TraceDataDiagnostics;
    diagnosticsKey: string;
  };
}

/** Tween state for domainTween. Initialised to NaN so the first frame snaps to fit-all. */
export interface TweenState {
  niceDomainMin: number;
  niceDomainMax: number;
}

/** Resolved annotation memoization entry (Spec 29). */
export interface AnnotationCache {
  annotationSpecsRef: TraceAnnotationSpec[];
  spansRef: NormalizedSpan[];
  result: { annotations: ResolvedTraceAnnotation[]; diagnostics: TraceDataDiagnostics; diagnosticsKey: string };
}

/** Disclosure state for one visible parent lane (caret + rolled-up descendant count). */
export interface DisclosureEntry {
  state: 'collapsed' | 'expanded';
  depth: number;
  descendantCount: number;
}

/** Memoized post-collapse step (collapseLanes + rollupCriticalIntervals + buildDisclosureMap). */
export interface CollapseCache {
  pipelineSpans: NormalizedSpan[];
  collapsed: ReadonlySet<string>;
  criticalIntervals: Array<{ spanId: string; start: number; end: number }>;
  result: NormalizedSpan[];
  rolledUpCriticalIntervals: Array<{ spanId: string; start: number; end: number }>;
  disclosure: Map<number, DisclosureEntry>;
}
