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
  return span.active.reduce((acc, seg) => acc + (seg.end - seg.start), 0);
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
 * start, and the x-axis State at the pointer position (Active / Waiting / —).
 *
 * `TooltipValue.datum` is set to the full `NormalizedSpan` without a cast — this works because
 * `TooltipValue<D>` defaults `D` to `Datum = any` (utils/common.tsx), so `datum` accepts any value.
 * The `datum` field lets a caller-supplied `customTooltip` reach `span.meta` (the original
 * `TraceDatum` or `OtelSpan`) and its OTel `attributes`/`status` (ADR 0002).
 * @internal
 */
export function buildTraceTooltipInfo(
  span: NormalizedSpan,
  index: number,
  domainMin: number,
  region: HoverRegion,
  color: string,
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
    datum: span, // NormalizedSpan; carries span.meta for customTooltip access
  });

  return {
    header: null,
    values: [
      row('Name', span.name, span.name),
      row('Duration', total, formatMs(total)),
      row('Self time', selfTime, formatMs(selfTime)),
      row('Start', startOffset, `+${formatMs(startOffset)}`),
      row('State', REGION_LABEL[region], REGION_LABEL[region]),
    ],
  };
}

/**
 * Builds the `TraceElementEvent` payload fired via `onElementClick` / `onElementOver`.
 *
 * Exposes the format-agnostic identity + timing fields (per ADR 0002) and the original `datum`
 * (`TraceDatum | OtelSpan`) so callers can access OTel `attributes`/`status` without importing
 * any `@internal` type.
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
