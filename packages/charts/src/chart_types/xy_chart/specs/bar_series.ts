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
import { useSpecFactory, buildSFProps } from '../../../state/spec_factory';
import type { Datum } from '../../../utils/common';
import { stripUndefined } from '../../../utils/common';
import type { BarSeriesSpec, BaseDatum } from '../utils/specs';
import { DEFAULT_GLOBAL_ID, SeriesType } from '../utils/specs';

const buildProps = buildSFProps<BarSeriesSpec>()(
  {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    seriesType: SeriesType.Bar,
  },
  {
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    hideInLegend: false,
    enableHistogramMode: false,
  },
);

/**
 * Adds bar series to chart specs
 * @public
 */
export const BarSeries = function <D extends BaseDatum = Datum>(
  props: SFProps<
    BarSeriesSpec<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<BarSeriesSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type BarSeriesProps = ComponentProps<typeof BarSeries>;
