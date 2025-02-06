/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TimeslipDataRows } from './timeslip/data_fetch';
import { DataDemand } from './timeslip/render/cartesian';
import { ChartType } from '..';
import { Spec } from '../../specs';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { SFProps } from '../../state/build_props_types';
import { buildSFProps } from '../../state/build_sf_props';
import { useSpecFactory } from '../../state/spec_factory';
import { stripUndefined } from '../../utils/common';

/**
 * data getter function
 * @public
 */
export type GetData = (dataDemand: DataDemand) => TimeslipDataRows;

/**
 * Specifies the timeslip chart
 * @public
 */
export interface TimeslipSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Timeslip;
  getData: GetData;
}

const buildProps = buildSFProps<TimeslipSpec>()(
  {
    chartType: ChartType.Timeslip,
    specType: SpecType.Series,
  },
  {},
);

/**
 * Adds timeslip spec to chart specs
 * @public
 */
export const Timeslip = (
  props: SFProps<
    TimeslipSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) => {
  const { defaults, overrides } = buildProps;
  useSpecFactory<TimeslipSpec>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};
