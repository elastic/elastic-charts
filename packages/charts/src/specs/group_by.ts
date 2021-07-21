/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Spec } from '.';
import { ChartType } from '../chart_types';
import { Predicate } from '../common/predicate';
import { getConnect, specComponentFactory } from '../state/spec_factory';
import { SpecType } from './constants';

/** @public */
export type GroupByAccessor = (spec: Spec, datum: any) => string | number;
/** @alpha */
export type GroupBySort = Predicate;

/**
 * Title formatter that handles any value returned from the GroupByAccessor
 * @public
 */
export type GroupByFormatter = (value: ReturnType<GroupByAccessor>) => string;

/** @alpha */
export interface GroupBySpec extends Spec {
  /**
   * Function to return a unique value __by__ which to group the data
   */
  by: GroupByAccessor;
  /**
   * Sort predicate used to sort grouped data
   */
  sort: GroupBySort;
  /**
   * Formatter used on all `by` values.
   *
   * Only for displayed values, not used in sorting or other internal computations.
   */
  format?: GroupByFormatter;
}
const DEFAULT_GROUP_BY_PROPS = {
  chartType: ChartType.Global,
  specType: SpecType.IndexOrder,
};

type DefaultGroupByProps = 'chartType' | 'specType';

/** @alpha */
export type GroupByProps = Pick<GroupBySpec, 'id' | 'by' | 'sort' | 'format'>;

/** @alpha */
export const GroupBy: React.FunctionComponent<GroupByProps> = getConnect()(
  specComponentFactory<GroupBySpec, DefaultGroupByProps>(DEFAULT_GROUP_BY_PROPS),
);
