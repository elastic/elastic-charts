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
 * Specifies the trace chart
 * @public
 */
export interface TraceSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Trace;
  data: TraceDatum[];
  format: 'simple' | 'otel';
  xScaleType: 'time' | 'linear';
}

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
  useSpecFactory<TraceSpec>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};
