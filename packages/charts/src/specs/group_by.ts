/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { Spec } from './spec';
import { SpecType } from './spec_type';
import { ChartType } from '../chart_types/chart_type';
import { BaseDatum } from '../chart_types/specs';
import { Predicate } from '../common/predicate';
import { SFProps } from '../state/build_props_types';
import { buildSFProps } from '../state/build_sf_props';
import { useSpecFactory } from '../state/spec_factory';
import { Datum } from '../utils/common';
import { stripUndefined } from '../utils/strip_undefined';

/** @public */
export type GroupByAccessor<D extends BaseDatum = any> = (spec: Spec, datum: D) => string | number;
/** @alpha */
export type GroupBySort = Predicate;

/**
 * Title formatter that handles any value returned from the GroupByAccessor
 * @public
 */
export type GroupByFormatter<D extends BaseDatum = any> = (value: ReturnType<GroupByAccessor<D>>) => string;

/** @alpha */
export interface GroupBySpec<D extends BaseDatum = any> extends Spec {
  /**
   * Function to return a unique value __by__ which to group the data
   */
  by: GroupByAccessor<D>;
  /**
   * Sort predicate used to sort grouped data
   */
  sort: GroupBySort;
  /**
   * Formatter used on all `by` values.
   *
   * Only for displayed values, not used in sorting or other internal computations.
   */
  format?: GroupByFormatter<D>;
}

const buildProps = buildSFProps<GroupBySpec>()(
  {
    chartType: ChartType.Global,
    specType: SpecType.IndexOrder,
  },
  {},
);

/**
 * Add GroupBy spec to chart
 * @public
 */
export const GroupBy = function <D extends BaseDatum = Datum>(
  props: SFProps<
    GroupBySpec<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<GroupBySpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type GroupByProps = ComponentProps<typeof GroupBy>;
