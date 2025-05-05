/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ComponentProps } from 'react';

import { ChartType } from '../..';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { SFProps } from '../../../state/spec_factory';
import { buildSFProps, useSpecFactory } from '../../../state/spec_factory';
import type { Datum } from '../../../utils/common';
import { stripUndefined } from '../../../utils/common';
import type { AreaSeriesSpec, BaseDatum } from '../utils/specs';
import { HistogramModeAlignments, DEFAULT_GLOBAL_ID, SeriesType } from '../utils/specs';

const buildProps = buildSFProps<AreaSeriesSpec>()(
  {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    seriesType: SeriesType.Area,
  },
  {
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
    hideInLegend: false,
    histogramModeAlignment: HistogramModeAlignments.Center,
  },
);

/**
 * Adds bar series to chart specs
 * @public
 */
export const AreaSeries = function <D extends BaseDatum = Datum>(
  props: SFProps<
    AreaSeriesSpec<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  useSpecFactory<AreaSeriesSpec<D>>(getAreaSeriesSpec(props));
  return null;
};

/** @public */
export type AreaSeriesProps = ComponentProps<typeof AreaSeries>;

/** @internal */
export function getAreaSeriesSpec<D extends BaseDatum = Datum>(
  props: SFProps<
    AreaSeriesSpec<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  return { ...defaults, ...stripUndefined(props), ...overrides };
}
