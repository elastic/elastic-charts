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
import type { BaseDatum, BubbleSeriesSpec } from '../utils/specs';
import { DEFAULT_GLOBAL_ID, SeriesType } from '../utils/specs';

const buildProps = buildSFProps<BubbleSeriesSpec>()(
  {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    seriesType: SeriesType.Bubble,
  },
  {
    groupId: DEFAULT_GLOBAL_ID,
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    hideInLegend: false,
  },
);

/**
 * Adds bar series to chart specs
 * @public
 */
export const BubbleSeries = function <D extends BaseDatum = Datum>(
  props: SFProps<
    BubbleSeriesSpec<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<BubbleSeriesSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type BubbleSeriesProps = ComponentProps<typeof BubbleSeries>;
