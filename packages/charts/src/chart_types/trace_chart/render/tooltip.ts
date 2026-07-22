/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TooltipInfo } from '../../../components/tooltip/types';
import type { TraceElementEvent } from '../../../specs/settings';
import { waitingSegments } from '../data/self_time';
import type { NormalizedSpan } from '../data/types';
import type { TraceSelectionDetail } from '../trace_api';
import type { HoverRegion } from './types';

/** @internal */
export function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms >= 1) return `${ms.toFixed(2)} ms`;
  if (ms >= 1e-3) return `${(ms * 1000).toFixed(0)} μs`;
  return `${(ms * 1e6).toFixed(0)} ns`;
}

/** @internal */
export function computeSelfTime(span: NormalizedSpan): number {
  return span.activeSegments.reduce((acc, seg) => acc + (seg.end - seg.start), 0);
}

const EMPTY_SERIES_ID = { specId: '', key: '' };

const REGION_LABEL: Record<HoverRegion, string> = {
  active: 'Active',
  waiting: 'Waiting',
  empty: '—',
  span: 'Collapsed',
};

/**
 * Builds the default `TooltipInfo` for a hovered trace span.
 *
 * Shows: Name, Duration (total extent), Self time (Σ active segments), Start offset from domain
 * start, the x-axis State at the pointer position (Active / Waiting / —), and — when hovering an
 * active segment in a span with more than one — an "Active segment" row showing that segment's own
 * duration with an ordinal `(i of n)`.
 *
 * When `criticalIntervals` is non-empty, a "Critical path" row shows the total coverage for this
 * span (Σ of all critical intervals attributed to this lane after rollup).
 *
 * `TooltipValue.datum` is the original `TraceDatum` (via `span.meta`), identical to the datum
 * exposed in `onElementClick` / `onElementOver` callbacks. A `customTooltip` can reach
 * source-specific data (e.g. OTel `attributes`/`status`) via `(values[0].datum as TraceDatum).meta`.
 * @internal
 */
export function buildTraceTooltipInfo(
  span: NormalizedSpan,
  index: number,
  domainMin: number,
  region: HoverRegion,
  color: string,
  segmentIndex: number,
  criticalIntervals?: ReadonlyArray<{ start: number; end: number }>,
): TooltipInfo {
  const total = span.end - span.start;
  const selfTime = computeSelfTime(span);
  const startOffset = span.start - domainMin;

  const row = (label: string, value: number | string, formattedValue: string) => ({
    label,
    color,
    isHighlighted: false,
    isVisible: true,
    seriesIdentifier: EMPTY_SERIES_ID,
    value,
    formattedValue,
    valueAccessor: index,
    // datum is the original TraceDatum (via span.meta) — consistent with onElementClick/onElementOver.
    // Access source-specific data (e.g. OtelSpan attributes) via (datum as TraceDatum).meta.
    datum: span.meta,
  });

  const values = [
    row('Name', span.name, span.name),
    row('Duration', total, formatMs(total)),
    row('Self time', selfTime, formatMs(selfTime)),
    row('Start', startOffset, `+${formatMs(startOffset)}`),
  ];
  if (span.skewCorrected) {
    values.push(row('Clock skew', 'Time adjusted for clock skew', 'Time adjusted for clock skew'));
  }
  values.push(row('State', REGION_LABEL[region], REGION_LABEL[region]));

  // When hovering an active segment, show that segment's own duration and its offset from trace start.
  // Omit the ordinal when there is only one segment (its duration equals self time — redundant).
  if (region === 'active' && segmentIndex >= 0) {
    const detail = segmentRowDetail(span, 'active', segmentIndex, domainMin);
    if (detail) {
      const { segDuration, segOffset, ordinalLabel } = detail;
      const label = `Active segment${ordinalLabel}`;
      // Insert duration at index 3 (after 'Self time'), offset at index 4 (after duration).
      // Row order: Name, Duration, Self time, Active segment, Active segment offset, Start, State.
      values.splice(3, 0, row(label, segDuration, formatMs(segDuration)));
      values.splice(4, 0, row('Active segment offset', segOffset, `+${formatMs(segOffset)}`));
    }
  }

  // When hovering a waiting segment, show symmetric duration/offset rows.
  if (region === 'waiting' && segmentIndex >= 0) {
    const detail = segmentRowDetail(span, 'waiting', segmentIndex, domainMin);
    if (detail) {
      const { segDuration, segOffset, ordinalLabel } = detail;
      const label = `Waiting segment${ordinalLabel}`;
      values.splice(3, 0, row(label, segDuration, formatMs(segDuration)));
      values.splice(4, 0, row('Waiting segment offset', segOffset, `+${formatMs(segOffset)}`));
    }
  }

  // When this lane has critical intervals, show the total critical-path coverage (Σ intervals).
  if (criticalIntervals && criticalIntervals.length > 0) {
    const coverage = criticalIntervals.reduce((acc, { start, end }) => acc + (end - start), 0);
    values.push(row('Critical path', coverage, formatMs(coverage)));
  }

  return { header: null, values };
}

/**
 * Returns segment timing fields for a tooltip row or `TraceSelectionDetail`, or `null` when the
 * index is out of range. Shared between `buildTraceTooltipInfo` and `buildTraceSelectionDetail`.
 */
function segmentRowDetail(
  span: NormalizedSpan,
  region: 'active' | 'waiting',
  segmentIndex: number,
  domainMin: number,
): { segStart: number; segEnd: number; segDuration: number; segOffset: number; ordinalLabel: string } | null {
  let segStart: number;
  let segEnd: number;
  let n: number;
  let phaseLabel: string | undefined;

  if (region === 'active') {
    const seg = span.activeSegments[segmentIndex];
    if (!seg) return null;
    segStart = seg.start;
    segEnd = seg.end;
    n = span.activeSegments.length;
    phaseLabel = seg.label;
  } else {
    const gaps = waitingSegments(span);
    const gap = gaps[segmentIndex];
    if (!gap) return null;
    segStart = gap.start;
    segEnd = gap.end;
    n = gaps.length;
  }

  const segDuration = segEnd - segStart;
  const segOffset = segStart - domainMin;

  // Build the ordinal/label suffix. Omit ordinal when there is only one segment.
  let ordinalLabel: string;
  if (phaseLabel !== undefined) {
    ordinalLabel = n > 1 ? `: ${phaseLabel} (${segmentIndex + 1} of ${n})` : `: ${phaseLabel}`;
  } else {
    ordinalLabel = n > 1 ? ` (${segmentIndex + 1} of ${n})` : '';
  }

  return { segStart, segEnd, segDuration, segOffset, ordinalLabel };
}

/**
 * Builds a `TraceSelectionDetail` entry for one selected ref. Called once per ref in the
 * `onSelectionChange` payload. Returns the same data the tooltip shows, plus all timing fields,
 * so consumers don't need to re-derive durations. See ADR 0011 Decision 3.
 * @internal
 */
export function buildTraceSelectionDetail(
  span: NormalizedSpan,
  domainMin: number,
  region: 'span' | 'active' | 'waiting',
  segmentIndex: number,
): TraceSelectionDetail {
  const duration = span.end - span.start;
  const selfTime = computeSelfTime(span);

  const detail: TraceSelectionDetail = {
    spanId: span.id,
    name: span.name,
    ...(span.parentId !== undefined && { parentId: span.parentId }),
    ...(span.traceId !== undefined && { traceId: span.traceId }),
    start: span.start,
    end: span.end,
    duration,
    selfTime,
    ...(span.skewCorrected && { skewCorrected: true }),
    datum: span.meta,
    region,
    segmentIndex,
  };

  if (region !== 'span' && segmentIndex >= 0) {
    const seg = segmentRowDetail(span, region, segmentIndex, domainMin);
    if (seg) {
      detail.segmentStart = seg.segStart;
      detail.segmentEnd = seg.segEnd;
      detail.segmentDuration = seg.segDuration;
      detail.segmentOffset = seg.segOffset;
    }
  }

  return detail;
}

/**
 * Builds the `TraceElementEvent` payload fired via `onElementClick` / `onElementOver`.
 *
 * Exposes the format-agnostic identity and timing fields plus the original `TraceDatum` (`datum`)
 * so callers can access source-specific data (e.g. OTel `attributes`/`status` via `datum.meta`)
 * without importing any `@internal` type.
 * @internal
 */
export function buildTraceEvent(span: NormalizedSpan): TraceElementEvent {
  return {
    type: 'traceElementEvent',
    id: span.id,
    name: span.name,
    ...(span.parentId !== undefined && { parentId: span.parentId }),
    ...(span.traceId !== undefined && { traceId: span.traceId }),
    start: span.start,
    end: span.end,
    duration: span.end - span.start,
    selfTime: computeSelfTime(span),
    ...(span.skewCorrected && { skewCorrected: true }),
    datum: span.meta,
  };
}
