/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getDataSeriesFromSpecs, XYChartSeriesIdentifier } from '../../chart_types/xy_chart/utils/series';
import { BasicSeriesSpec } from '../../specs';
import { mergePartial } from '../../utils/common';

/** @internal */
export class MockSeriesIdentifier {
  private static readonly base: XYChartSeriesIdentifier = {
    specId: 'bars',
    xAccessor: 'x',
    yAccessor: 'y',
    seriesKeys: ['a'],
    splitAccessors: new Map().set('g', 'a'),
    key: 'spec{bars}yAccessor{y}splitAccessors{g-a}',
  };

  static default(partial?: Partial<XYChartSeriesIdentifier>) {
    return mergePartial<XYChartSeriesIdentifier>(MockSeriesIdentifier.base, partial);
  }

  static fromSpecs(specs: BasicSeriesSpec[]): XYChartSeriesIdentifier[] {
    const { dataSeries } = getDataSeriesFromSpecs(specs);

    return dataSeries.map(
      // eslint-disable-next-line object-curly-newline
      ({ groupId, seriesType, data, isStacked, stackMode, spec, insertIndex, sortOrder, isFiltered, ...rest }) => rest,
    );
  }

  static fromSpec(specs: BasicSeriesSpec): XYChartSeriesIdentifier {
    return MockSeriesIdentifier.fromSpecs([specs])[0]!;
  }
}
