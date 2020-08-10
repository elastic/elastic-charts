/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { ChartTypes } from '../..';
import { Spec } from '../../../specs';
import { SpecTypes } from '../../../specs/constants';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { AccessorFn } from '../../../utils/accessor';
import { Color, Datum, RecursivePartial } from '../../../utils/commons';
import { config } from '../layout/config/config';
import { Config } from '../layout/types/config_types';
import { Predicate } from '../utils/commons';

const defaultProps = {
  chartType: ChartTypes.Heatmap,
  specType: SpecTypes.Series,
  data: [],
  colors: ['red', 'yellow', 'green'],
  xAccessor: ({ x }: { x: string | number }) => x,
  yAccessor: ({ y }: { y: string | number }) => y,
  valueAccessor: ({ value }: { value: string | number }) => value,
  valueFormatter: (value: number) => `${value}`,
  xSortPredicate: Predicate.AlphaAsc,
  ySortPredicate: Predicate.AlphaAsc,
  config,
};

/** @alpha */
export interface HeatmapSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Heatmap;
  data: Datum[];
  colorDomain?: number[];
  colors: Color[];
  xAccessor: AccessorFn;
  yAccessor: AccessorFn;
  valueAccessor: AccessorFn;
  valueFormatter: (value: number) => string;
  xSortPredicate: Predicate;
  ySortPredicate: Predicate;
  config: RecursivePartial<Config>;
}

type SpecRequiredProps = Pick<HeatmapSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<HeatmapSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

/** @alpha */
export const Heatmap: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    HeatmapSpec,
    | 'xAccessor'
    | 'yAccessor'
    | 'valueAccessor'
    | 'colors'
    | 'data'
    | 'ySortPredicate'
    | 'xSortPredicate'
    | 'valueFormatter'
    | 'config'
  >(defaultProps),
);
