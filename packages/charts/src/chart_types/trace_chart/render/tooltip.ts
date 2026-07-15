/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TooltipInfo } from '../../../components/tooltip/types';
import type { TraceElementEvent } from '../../../specs/settings';
import type { NormalizedSpan } from '../data/types';
import type { HoverRegion } from './types';

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms >= 1) return `${ms.toFixed(2)} ms`;
  return `${(ms * 1000).toFixed(0)} μs`;
}

function computeSelfTime(span: NormalizedSpan): number {
  return span.activeSegments.reduce((acc, seg) => acc + (seg.end - seg.start), 0);
}

const EMPTY_SERIES_ID = { specId: '', key: '' };

const REGION_LABEL: Record<HoverRegion, string> = {
  active: 'Active',
  waiting: 'Waiting',
  empty: '—',
};

/**
 * Builds the default `TooltipInfo` for a hovered trace span.
 *
 * Shows: Name, Duration (total extent), Self time (Σ active segments), Start offset from domain
 * start, the x-axis State at the pointer position (Active / Waiting / —), and — when hovering an
 * active segment in a span with more than one — an "Active segment" row showing that segment's own
 * duration with an ordinal `(i of n)`.
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
    row('State', REGION_LABEL[region], REGION_LABEL[region]),
  ];

  // When hovering an active segment, show that segment's own duration and its offset from trace start.
  // Omit the ordinal when there is only one segment (its duration equals self time — redundant).
  if (region === 'active' && segmentIndex >= 0) {
    const seg = span.activeSegments[segmentIndex];
    if (seg) {
      const segDuration = seg.end - seg.start;
      const segOffset = seg.start - domainMin; // from trace start, same baseline as the 'Start' row
      const n = span.activeSegments.length;
      const label = n > 1 ? `Active segment (${segmentIndex + 1} of ${n})` : 'Active segment';
      // Insert duration at index 3 (after 'Self time'), offset at index 4 (after duration).
      // Row order: Name, Duration, Self time, Active segment, Active segment offset, Start, State.
      values.splice(3, 0, row(label, segDuration, formatMs(segDuration)));
      values.splice(4, 0, row('Active segment offset', segOffset, `+${formatMs(segOffset)}`));
    }
  }

  return { header: null, values };
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
    datum: span.meta,
  };
}
