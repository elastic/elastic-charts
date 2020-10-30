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

import {
  SeriesCollectionValue,
  getDataSeriesFromSpecs,
  XYChartSeriesIdentifier,
} from '../../chart_types/xy_chart/utils/series';
import { BasicSeriesSpec, DEFAULT_SINGLE_PANEL_SM_VALUE } from '../../specs';
import { mergePartial } from '../../utils/commons';

type SeriesCollection = Map<string, SeriesCollectionValue>;

/** @internal */
export class MockSeriesCollection {
  static empty(): SeriesCollection {
    return new Map();
  }

  static fromSpecs(seriesSpecs: BasicSeriesSpec[]) {
    const { seriesCollection } = getDataSeriesFromSpecs(seriesSpecs, []);

    return seriesCollection;
  }
}

/** @internal */
export class MockSeriesIdentifier {
  private static readonly base: XYChartSeriesIdentifier = {
    specId: 'bars',
    yAccessor: 'y',
    seriesKeys: ['a'],
    splitAccessors: new Map().set('g', 'a'),
    key: `spec{bars}yAccessor{y}splitAccessors{g-a}smV${DEFAULT_SINGLE_PANEL_SM_VALUE}smH${DEFAULT_SINGLE_PANEL_SM_VALUE}`,
    smHorizontalAccessorValue: DEFAULT_SINGLE_PANEL_SM_VALUE,
    smVerticalAccessorValue: DEFAULT_SINGLE_PANEL_SM_VALUE,
  };

  static default(partial?: Partial<XYChartSeriesIdentifier>) {
    return mergePartial<XYChartSeriesIdentifier>(MockSeriesIdentifier.base, partial, {
      mergeOptionalPartialValues: true,
    });
  }

  static fromSpecs(specs: BasicSeriesSpec[]): XYChartSeriesIdentifier[] {
    const { dataSeries } = getDataSeriesFromSpecs(specs);

    return dataSeries.map(({ groupId, seriesType, data, isStacked, stackMode, spec, ...rest }) => rest);
  }

  static fromSpec(specs: BasicSeriesSpec): XYChartSeriesIdentifier {
    return MockSeriesIdentifier.fromSpecs([specs])[0];
  }
}
