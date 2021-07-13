/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../..';
import { Pixels } from '../../../common/geometry';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants'; // kept as unshortened import on separate line otherwise import circularity emerges
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { IndexedAccessorFn } from '../../../utils/accessor';
import {
  Datum,
  LabelAccessor,
  RecursivePartial,
  ShowAccessor,
  ValueAccessor,
  ValueFormatter,
} from '../../../utils/common';
import { config, percentFormatter } from '../layout/config';
import { Config, FillFontSizeRange, FillLabelConfig } from '../layout/types/config_types';
import { NodeColorAccessor, ShapeTreeNode, ValueGetter } from '../layout/types/viewmodel_types';
import { AGGREGATE_KEY, NodeSorter, PrimitiveValue } from '../layout/utils/group_by_rollup';

interface ExtendedFillLabelConfig extends FillLabelConfig, FillFontSizeRange {}

/**
 * Specification for a given layer in the partition chart
 * @public
 */
export interface Layer {
  groupByRollup: IndexedAccessorFn;
  sortPredicate?: NodeSorter | null;
  nodeLabel?: LabelAccessor;
  fillLabel?: Partial<ExtendedFillLabelConfig>;
  showAccessor?: ShowAccessor;
  shape?: { fillColor: string | NodeColorAccessor };
}

const defaultProps = {
  chartType: ChartType.Partition,
  specType: SpecType.Series,
  config,
  valueAccessor: (d: Datum) => (typeof d === 'number' ? d : 0),
  valueGetter: (n: ShapeTreeNode): number => n[AGGREGATE_KEY],
  valueFormatter: (d: number): string => String(d),
  percentFormatter,
  topGroove: 20,
  smallMultiples: null,
  layers: [
    {
      groupByRollup: (d: Datum, i: number) => i,
      nodeLabel: (d: PrimitiveValue) => String(d),
      showAccessor: () => true,
      fillLabel: {},
    },
  ],
};

/**
 * Specifies the partition chart
 * @public
 */
export interface PartitionSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Partition;
  config: RecursivePartial<Config>;
  data: Datum[];
  valueAccessor: ValueAccessor;
  valueFormatter: ValueFormatter;
  valueGetter: ValueGetter;
  percentFormatter: ValueFormatter;
  topGroove: Pixels;
  smallMultiples: string | null;
  layers: Layer[];
}

type SpecRequiredProps = Pick<PartitionSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<PartitionSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

/** @public */
export const Partition: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    PartitionSpec,
    | 'valueAccessor'
    | 'valueGetter'
    | 'valueFormatter'
    | 'layers'
    | 'config'
    | 'percentFormatter'
    | 'topGroove'
    | 'smallMultiples'
  >(defaultProps),
);
