/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { ChartType } from '../..';
import { Pixels } from '../../../common/geometry';
import { BaseDatum, Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants'; // kept as unshortened import on separate line otherwise import circularity emerges
import { buildSFProps, SFProps, useSpecFactory } from '../../../state/spec_factory';
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
import { NodeColorAccessor, ValueGetter } from '../layout/types/viewmodel_types';
import { AGGREGATE_KEY, NodeSorter } from '../layout/utils/group_by_rollup';

interface ExtendedFillLabelConfig extends FillLabelConfig, FillFontSizeRange {}

/**
 * Specification for a given layer in the partition chart
 * @public
 */
export interface Layer<D extends BaseDatum = Datum> {
  groupByRollup: IndexedAccessorFn<D>;
  sortPredicate?: NodeSorter | null;
  nodeLabel?: LabelAccessor;
  fillLabel?: Partial<ExtendedFillLabelConfig>;
  showAccessor?: ShowAccessor;
  shape?: { fillColor: string | NodeColorAccessor };
}

/**
 * Specifies the partition chart
 * @public
 */
export interface PartitionSpec<D extends BaseDatum = Datum> extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Partition;
  config: RecursivePartial<Config>;
  data: D[];
  valueAccessor: ValueAccessor<D>;
  valueFormatter: ValueFormatter;
  valueGetter: ValueGetter;
  percentFormatter: ValueFormatter;
  topGroove: Pixels;
  smallMultiples: string | null;
  layers: Layer<D>[];
}

const buildProps = buildSFProps<PartitionSpec>()(
  {
    chartType: ChartType.Partition,
    specType: SpecType.Series,
  },
  {
    config,
    valueAccessor: (d) => (typeof d === 'number' ? d : 0),
    valueGetter: (n) => n[AGGREGATE_KEY],
    valueFormatter: (d) => String(d),
    percentFormatter,
    topGroove: 20,
    smallMultiples: null,
    layers: [
      {
        groupByRollup: (d, i) => i,
        nodeLabel: (d) => String(d),
        showAccessor: () => true,
        fillLabel: {},
      },
    ],
  },
);

/**
 * Adds partition spec to chart specs
 * @public
 */
export const Partition = function <D extends BaseDatum = Datum>(
  props: SFProps<
    PartitionSpec<D>,
    keyof typeof buildProps['overrides'],
    keyof typeof buildProps['defaults'],
    keyof typeof buildProps['optionals'],
    keyof typeof buildProps['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<PartitionSpec<D>>({ ...defaults, ...props, ...overrides });
  return null;
};

/** @public */
export type PartitionProps = ComponentProps<typeof Partition>;
