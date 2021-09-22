/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../..';
import { Distance, Pixels, Radius } from '../../../common/geometry';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants'; // kept as unshortened import on separate line otherwise import circularity emerges
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { IndexedAccessorFn } from '../../../utils/accessor';
import { Datum, LabelAccessor, ShowAccessor, ValueAccessor, ValueFormatter } from '../../../utils/common';
import { defaultValueFormatter, percentFormatter } from '../layout/config';
import { AnimationConfig, FillFontSizeRange, FillLabelConfig, PartitionLayout } from '../layout/types/config_types';
import { NodeColorAccessor, ShapeTreeNode, ValueGetter } from '../layout/types/viewmodel_types';
import { AGGREGATE_KEY, NodeSorter, PrimitiveValue } from '../layout/utils/group_by_rollup';

interface ExtendedFillLabelConfig extends FillLabelConfig, FillFontSizeRange {
  valueFormatter: ValueFormatter;
}

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

/**
 * @todo: we really need these typed, but since `specComponentFactory` has the typing
 * for optional and required props built-in, this is not currently possible.
 */
const defaultProps = {
  chartType: ChartType.Partition,
  specType: SpecType.Series,
  valueAccessor: (d: Datum) => (typeof d === 'number' ? d : 0),
  valueGetter: (n: ShapeTreeNode): number => n[AGGREGATE_KEY],
  valueFormatter: (d: number): string => String(d),
  linkLabelValueFormatter: (d: number): string => String(d),
  fillLabelValueFormatter: defaultValueFormatter,
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
  clockwiseSectors: true,
  specialFirstInnermostSector: true,
  layout: PartitionLayout.sunburst,
  drilldown: false,
  maxRowCount: 12,
  fillOutside: false,
  radiusOutside: 128,
  fillRectangleWidth: Infinity,
  fillRectangleHeight: Infinity,
};

/**
 * Specifies the partition chart
 * @public
 */
export interface PartitionSpec extends Spec, AnimationConfig {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Partition;
  data: Datum[];
  valueAccessor: ValueAccessor;
  valueFormatter: ValueFormatter;
  valueGetter: ValueGetter;
  percentFormatter: ValueFormatter;
  topGroove: Pixels;
  smallMultiples: string | null;
  layers: Layer[];
  linkLabelValueFormatter: ValueFormatter;
  fillLabelValueFormatter: ValueFormatter;
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

type SpecRequiredProps = Pick<PartitionSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<PartitionSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

/** @public */
export const Partition: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    PartitionSpec,
    | 'valueAccessor'
    | 'valueGetter'
    | 'valueFormatter'
    | 'linkLabelValueFormatter'
    | 'fillLabelValueFormatter'
    | 'percentFormatter'
    | 'topGroove'
    | 'smallMultiples'
    | 'layers'
    | 'clockwiseSectors'
    | 'specialFirstInnermostSector'
    | 'layout'
    | 'drilldown'
    | 'maxRowCount'
    | 'fillOutside'
    | 'radiusOutside'
    | 'fillRectangleWidth'
    | 'fillRectangleHeight'
  >(defaultProps),
);
