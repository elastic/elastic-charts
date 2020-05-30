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
import { Spec, SpecTypes } from '../../../specs';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { IndexedAccessorFn } from '../../../utils/accessor';
import {
  Datum,
  LabelAccessor,
  RecursivePartial,
  ShowAccessor,
  ValueAccessor,
  ValueFormatter,
} from '../../../utils/commons';
import { config, percentFormatter } from '../layout/config/config';
import { Config, FillFontSizeRange, FillLabelConfig } from '../layout/types/config_types';
import { Pixels } from '../layout/types/geometry_types';
import { ShapeTreeNode, ValueGetter, NodeColorAccessor } from '../layout/types/viewmodel_types';
import { AGGREGATE_KEY, PrimitiveValue } from '../layout/utils/group_by_rollup';

interface ExtendedFillLabelConfig extends FillLabelConfig, FillFontSizeRange {}

export interface Layer {
  groupByRollup: IndexedAccessorFn;
  nodeLabel?: LabelAccessor;
  fillLabel?: Partial<ExtendedFillLabelConfig>;
  showAccessor?: ShowAccessor;
  shape?: { fillColor: string | NodeColorAccessor };
}

const defaultProps = {
  chartType: ChartTypes.Partition,
  specType: SpecTypes.Series,
  config,
  valueAccessor: (d: Datum) => (typeof d === 'number' ? d : 0),
  valueGetter: (n: ShapeTreeNode): number => n[AGGREGATE_KEY],
  valueFormatter: (d: number): string => String(d),
  percentFormatter,
  topGroove: 20,
  layers: [
    {
      groupByRollup: (d: Datum, i: number) => i,
      nodeLabel: (d: PrimitiveValue) => String(d),
      showAccessor: () => true,
      fillLabel: {},
    },
  ],
};

export interface PartitionSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Partition;
  config: RecursivePartial<Config>;
  data: Datum[];
  valueAccessor: ValueAccessor;
  valueFormatter: ValueFormatter;
  valueGetter: ValueGetter;
  percentFormatter: ValueFormatter;
  topGroove: Pixels;
  layers: Layer[];
}

type SpecRequiredProps = Pick<PartitionSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<PartitionSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

export const Partition: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    PartitionSpec,
    'valueAccessor' | 'valueGetter' | 'valueFormatter' | 'layers' | 'config' | 'percentFormatter' | 'topGroove'
  >(defaultProps),
);
