/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '..';
import type { Color } from '../../common/colors';
import type { Spec } from '../../specs/spec_type';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { SFProps } from '../../state/spec_factory';
import { buildSFProps, useSpecFactory } from '../../state/spec_factory';
import { stripUndefined } from '../../utils/common';
import type { OtelInput } from './data/types';

// Re-export the OTel input types so consumers using format='otel' don't need a separate import.
export type { OtelInput };
export type { OtelSpan, OtlpEnvelope } from './data/types';

/**
 * A single span in the "simple" input format.
 * @public
 */
export interface TraceDatum {
  id: string;
  name: string;
  parentId?: string;
  traceId?: string;
  start: number;
  end: number;
  active?: { start: number; end: number }[];
  color?: Color;
}

/**
 * Base fields shared by both `TraceSpec` variants.
 * @public
 */
interface TraceSpecBase extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Trace;
  xScaleType: 'time' | 'linear';
  /**
   * When `true`, the tooltip also appears while hovering the empty region of a lane
   * (past the span's `[start, end]` extent). Defaults to `false` — the span, not the
   * whole lane, is the hover target.
   * @public
   */
  showTooltipOverEmpty?: boolean;
}

/**
 * `TraceSpec` for the `format: 'simple'` path — data is an array of `TraceDatum`.
 * @public
 */
export interface TraceSpecSimple extends TraceSpecBase {
  format: 'simple';
  data: TraceDatum[];
}

/**
 * `TraceSpec` for the `format: 'otel'` path — data is an OTLP envelope or a flat `OtelSpan[]`.
 * @public
 */
export interface TraceSpecOtel extends TraceSpecBase {
  format: 'otel';
  data: OtelInput;
}

/**
 * Discriminated union spec for the trace chart. The `format` field selects the input shape.
 * TypeScript narrows `data` to the correct type when you check `spec.format`.
 * @public
 */
export type TraceSpec = TraceSpecSimple | TraceSpecOtel;

const buildProps = buildSFProps<TraceSpec>()(
  {
    chartType: ChartType.Trace,
    specType: SpecType.Series,
  },
  {
    xScaleType: 'time',
  },
);

/**
 * Adds trace spec to chart specs
 * @public
 */
export const Trace = (
  props: SFProps<
    TraceSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) => {
  const { defaults, overrides } = buildProps;
  // @ts-ignore — All Spec keys are guaranteed by SFProps; spreading a discriminated union loses the
  // discriminant in TS's inference (format becomes 'simple'|'otel' after spread), but the combined
  // value is a valid TraceSpec instance at runtime. Follows the same pattern as specComponentFactory.
  useSpecFactory<TraceSpec>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};
