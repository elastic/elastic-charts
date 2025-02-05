/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { BaseDatum } from '../../../chart_types/specs';
import { LegacyAnimationConfig } from '../../../common/animation';
import { Distance, Pixels, Radius } from '../../../common/geometry';
import { Spec } from '../../../specs/spec';
import { SpecType } from '../../../specs/spec_type'; // kept as unshortened import on separate line otherwise import circularity emerges
import { SFProps } from '../../../state/build_props_types';
import { buildSFProps } from '../../../state/build_sf_props';
import { useSpecFactory } from '../../../state/spec_factory';
import { IndexedAccessorFn } from '../../../utils/accessor';
import {
  Datum,
  LabelAccessor,
  ShowAccessor,
  ValueAccessor,
  ValueFormatter,
  stripUndefined,
} from '../../../utils/common';
import { FillFontSizeRange, FillLabelConfig } from '../../../utils/themes/partition';
import { ChartType } from '../../chart_type';
import { percentFormatter } from '../layout/config';
import { PartitionLayout } from '../layout/types/config_types';
import { NodeColorAccessor, ValueGetter } from '../layout/types/viewmodel_types';
import { NodeSorter, AGGREGATE_KEY } from '../layout/utils/group_by_rollup';

interface ExtendedFillLabelConfig extends FillLabelConfig, FillFontSizeRange {
  valueFormatter: ValueFormatter;
}

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
export interface PartitionSpec<D extends BaseDatum = Datum> extends Spec, LegacyAnimationConfig {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Partition;
  data: D[];
  valueAccessor: ValueAccessor<D>;
  valueFormatter: ValueFormatter;
  valueGetter: ValueGetter;
  percentFormatter: ValueFormatter;
  topGroove: Pixels;
  smallMultiples: string | null;
  layers: Layer<D>[];
  /**
   * Largest to smallest sectors are positioned in a clockwise order
   */
  clockwiseSectors: boolean;
  /**
   * Starts placement with the second largest slice, for the innermost pie/ring
   */
  specialFirstInnermostSector: boolean;
  layout: PartitionLayout;
  maxRowCount: number;
  /** @alpha */
  drilldown: boolean;

  // These need examples or documentation
  fillOutside: boolean;
  radiusOutside: Radius;
  fillRectangleWidth: Distance;
  fillRectangleHeight: Distance;
}

const buildProps = buildSFProps<PartitionSpec>()(
  {
    chartType: ChartType.Partition,
    specType: SpecType.Series,
  },
  {
    valueAccessor: (d) => (typeof d === 'number' ? d : 0),
    valueGetter: (n) => n[AGGREGATE_KEY],
    valueFormatter: (d) => String(d),
    percentFormatter,
    topGroove: 20,
    smallMultiples: '__global__small_multiples___',
    layers: [
      {
        groupByRollup: (_, i) => i,
        nodeLabel: (d) => String(d),
        showAccessor: () => true,
        fillLabel: {},
      },
    ],
    clockwiseSectors: true,
    specialFirstInnermostSector: true,
    layout: PartitionLayout.sunburst,
    drilldown: false,
    maxRowCount: 12,
    fillOutside: false,
    radiusOutside: 128,
    fillRectangleWidth: Infinity,
    fillRectangleHeight: Infinity,
    animation: { duration: 0 },
  },
);

/**
 * Adds partition spec to chart specs
 * @public
 */
export const Partition = function <D extends BaseDatum = Datum>(
  props: SFProps<
    PartitionSpec<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<PartitionSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type PartitionProps = ComponentProps<typeof Partition>;
