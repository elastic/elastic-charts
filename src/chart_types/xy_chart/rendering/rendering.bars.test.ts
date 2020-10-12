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

import { ChartTypes } from '../..';
import { MockBarGeometry } from '../../../mocks';
import { ScaleType } from '../../../scales/constants';
import { SpecTypes } from '../../../specs/constants';
import { identity } from '../../../utils/commons';
import { GroupId } from '../../../utils/ids';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { computeSeriesDomains } from '../state/utils/utils';
import { computeXScale, computeYScales } from '../utils/scales';
import { BarSeriesSpec, DomainRange, SeriesTypes } from '../utils/specs';
import { renderBars } from './rendering';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering bars', () => {
  describe('Single series bar chart - ordinal', () => {
    const barSeriesSpec: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [-200, 0],
        [0, 10],
        [1, 5],
      ], // first datum should be skipped as it's out of domain
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesMap = [barSeriesSpec];
    const customDomain = [0, 1];
    const barSeriesDomains = computeSeriesDomains(barSeriesMap, new Map(), [], customDomain);
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: barSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });

    test('Can render two bars within domain', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
      );

      const getBarGeometry = MockBarGeometry.fromBaseline(
        {
          x: 0,
          y: 0,
          width: 50,
          height: 100,
          color: 'red',
          value: {
            accessor: 'y1',
            x: 0,
            y: 10,
            mark: null,
            datum: [0, 10],
          },
          seriesIdentifier: {
            specId: SPEC_ID,
            key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
            yAccessor: 1,
            splitAccessors: new Map(),
            seriesKeys: [1],
          },
        },
        'displayValue',
      );
      expect(barGeometries[0]).toEqual(getBarGeometry());
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 50,
          y: 50,
          width: 50,
          height: 50,
          value: {
            x: 1,
            y: 5,
            datum: [1, 5],
          },
        }),
      );
      expect(barGeometries.length).toBe(2);
    });
    test('Can render bars with value labels', () => {
      const valueFormatter = identity;
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
        { valueFormatter, showValueLabel: true, isAlternatingValueLabel: true },
      );
      expect(barGeometries[0].displayValue).toBeDefined();
    });

    test('Can hide value labels if no formatter or showValueLabels is false/undefined', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
        {},
      );
      expect(barGeometries[0].displayValue).toBeUndefined();
    });

    test('Can render bars with alternating value labels', () => {
      const valueFormatter = identity;
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
        { valueFormatter, showValueLabel: true, isAlternatingValueLabel: true },
      );
      expect(barGeometries[0].displayValue?.text).toBeDefined();
      expect(barGeometries[1].displayValue?.text).toBeUndefined();
    });

    test('Can render bars with contained value labels', () => {
      const valueFormatter = identity;
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
        { valueFormatter, showValueLabel: true, isValueContainedInElement: true },
      );
      expect(barGeometries[0].displayValue?.width).toBe(50);
    });
  });
  describe('Multi series bar chart - ordinal', () => {
    const spec1Id = 'bar1';
    const spec2Id = 'bar2';
    const barSeriesSpec1: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesSpec2: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [0, 20],
        [1, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesMap = [barSeriesSpec1, barSeriesSpec2];
    const barSeriesDomains = computeSeriesDomains(barSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: barSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });
    const getBarGeometry = MockBarGeometry.fromBaseline(
      {
        x: 0,
        y: 0,
        width: 50,
        height: 100,
        color: 'red',
        value: {
          accessor: 'y1',
          x: 0,
          y: 10,
          mark: null,
          datum: [0, 10],
        },
        seriesIdentifier: {
          specId: spec1Id,
          key: 'spec{bar1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
      },
      'displayValue',
    );

    test('can render first spec bars', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
      );
      expect(barGeometries.length).toEqual(2);
      expect(barGeometries[0]).toEqual(
        getBarGeometry({
          x: 0,
          y: 50,
          width: 25,
          height: 50,
          value: {
            x: 0,
            y: 10,
            datum: [0, 10],
          },
        }),
      );
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 50,
          y: 75,
          width: 25,
          height: 25,
          value: {
            x: 1,
            y: 5,
            datum: [1, 5],
          },
        }),
      );
    });
    test('can render second spec bars', () => {
      const { barGeometries } = renderBars(
        1,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        LIGHT_THEME.barSeriesStyle,
      );
      const getBarGeometry = MockBarGeometry.fromBaseline(
        {
          x: 0,
          y: 0,
          width: 50,
          height: 100,
          color: 'blue',
          value: {
            accessor: 'y1',
            x: 0,
            y: 10,
            datum: [0, 10],
          },
          seriesIdentifier: {
            specId: spec2Id,
            key: 'spec{bar2}yAccessor{1}splitAccessors{}',
            yAccessor: 1,
            splitAccessors: new Map(),
            seriesKeys: [1],
          },
        },
        'displayValue',
      );
      expect(barGeometries.length).toEqual(2);
      expect(barGeometries[0]).toEqual(
        getBarGeometry({
          x: 25,
          y: 0,
          width: 25,
          height: 100,
          value: {
            x: 0,
            y: 20,
            datum: [0, 20],
          },
        }),
      );
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 75,
          y: 50,
          width: 25,
          height: 50,
          value: {
            x: 1,
            y: 10,
            datum: [1, 10],
          },
        }),
      );
    });
  });
  describe('Single series bar chart - linear', () => {
    const barSeriesSpec: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesMap = [barSeriesSpec];
    const barSeriesDomains = computeSeriesDomains(barSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: barSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });

    test('Can render two bars', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
      );
      const getBarGeometry = MockBarGeometry.fromBaseline(
        {
          x: 0,
          y: 0,
          width: 50,
          height: 100,
          color: 'red',
          value: {
            accessor: 'y1',
            x: 0,
            y: 10,
            mark: null,
            datum: [0, 10],
          },
          seriesIdentifier: {
            specId: SPEC_ID,
            key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
            yAccessor: 1,
            splitAccessors: new Map(),
            seriesKeys: [1],
          },
        },
        'displayValue',
      );
      expect(barGeometries[0]).toEqual(getBarGeometry());
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 50,
          y: 50,
          width: 50,
          height: 50,
          value: {
            x: 1,
            y: 5,
            datum: [1, 5],
          },
        }),
      );
    });
  });
  describe('Single series bar chart - log', () => {
    const barSeriesSpec: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [1, 0],
        [2, 1],
        [3, 2],
        [4, 3],
        [5, 4],
        [6, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Log,
    };
    const barSeriesDomains = computeSeriesDomains([barSeriesSpec], new Map());
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: 1,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });

    test('Can render correct bar height', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
      );
      expect(barGeometries.length).toBe(6);
      expect(barGeometries[0].height).toBe(0);
      expect(barGeometries[1].height).toBe(0);
      expect(barGeometries[2].height).toBeGreaterThan(0);
      expect(barGeometries[3].height).toBeGreaterThan(0);
    });
  });
  describe('Multi series bar chart - linear', () => {
    const spec1Id = 'bar1';
    const spec2Id = 'bar2';
    const barSeriesSpec1: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesSpec2: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [0, 20],
        [1, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesMap = [barSeriesSpec1, barSeriesSpec2];
    const barSeriesDomains = computeSeriesDomains(barSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: barSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });

    test('can render first spec bars', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
      );
      const getBarGeometry = MockBarGeometry.fromBaseline(
        {
          x: 0,
          y: 50,
          width: 25,
          height: 50,
          color: 'red',
          value: {
            accessor: 'y1',
            x: 0,
            y: 10,
            datum: [0, 10],
          },
          seriesIdentifier: {
            specId: spec1Id,
            key: 'spec{bar1}yAccessor{1}splitAccessors{}',
            yAccessor: 1,
            splitAccessors: new Map(),
            seriesKeys: [1],
          },
        },
        'displayValue',
      );
      expect(barGeometries.length).toEqual(2);
      expect(barGeometries[0]).toEqual(getBarGeometry());
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 50,
          y: 75,
          width: 25,
          height: 25,
          value: {
            x: 1,
            y: 5,
            datum: [1, 5],
          },
        }),
      );
    });
    test('can render second spec bars', () => {
      const { barGeometries } = renderBars(
        1,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        LIGHT_THEME.barSeriesStyle,
      );
      const getBarGeometry = MockBarGeometry.fromBaseline(
        {
          x: 25,
          y: 0,
          width: 25,
          height: 100,
          color: 'blue',
          value: {
            accessor: 'y1',
            x: 0,
            y: 20,
            datum: [0, 20],
          },
          seriesIdentifier: {
            specId: spec2Id,
            key: 'spec{bar2}yAccessor{1}splitAccessors{}',
            yAccessor: 1,
            splitAccessors: new Map(),
            seriesKeys: [1],
          },
        },
        'displayValue',
      );
      expect(barGeometries.length).toEqual(2);
      expect(barGeometries[0]).toEqual(getBarGeometry());
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 75,
          y: 50,
          width: 25,
          height: 50,
          color: 'blue',
          value: {
            x: 1,
            y: 10,
            datum: [1, 10],
          },
        }),
      );
    });
  });
  describe('Multi series bar chart - time', () => {
    const spec1Id = 'bar1';
    const spec2Id = 'bar2';
    const barSeriesSpec1: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [1546300800000, 10],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesSpec2: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [1546300800000, 20],
        [1546387200000, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesMap = [barSeriesSpec1, barSeriesSpec2];
    const barSeriesDomains = computeSeriesDomains(barSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: barSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });

    test('can render first spec bars', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
      );
      const getBarGeometry = MockBarGeometry.fromBaseline(
        {
          x: 0,
          y: 50,
          width: 25,
          height: 50,
          color: 'red',
          value: {
            accessor: 'y1',
            x: 1546300800000,
            y: 10,
            datum: [1546300800000, 10],
          },
          seriesIdentifier: {
            specId: spec1Id,
            key: 'spec{bar1}yAccessor{1}splitAccessors{}',
            yAccessor: 1,
            splitAccessors: new Map(),
            seriesKeys: [1],
          },
        },
        'displayValue',
      );
      expect(barGeometries.length).toEqual(2);
      expect(barGeometries[0]).toEqual(getBarGeometry());
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 50,
          y: 75,
          width: 25,
          height: 25,
          value: {
            accessor: 'y1',
            x: 1546387200000,
            y: 5,
            mark: null,
            datum: [1546387200000, 5],
          },
        }),
      );
    });
    test('can render second spec bars', () => {
      const { barGeometries } = renderBars(
        1,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        LIGHT_THEME.barSeriesStyle,
      );
      const getBarGeometry = MockBarGeometry.fromBaseline(
        {
          x: 25,
          y: 0,
          width: 25,
          height: 100,
          color: 'blue',
          value: {
            accessor: 'y1',
            x: 1546300800000,
            y: 20,
            mark: null,
            datum: [1546300800000, 20],
          },
          seriesIdentifier: {
            specId: spec2Id,
            key: 'spec{bar2}yAccessor{1}splitAccessors{}',
            yAccessor: 1,
            splitAccessors: new Map(),
            seriesKeys: [1],
          },
        },
        'displayValue',
      );

      expect(barGeometries.length).toEqual(2);
      expect(barGeometries[0]).toEqual(getBarGeometry());
      expect(barGeometries[1]).toEqual(
        getBarGeometry({
          x: 75,
          y: 50,
          width: 25,
          height: 50,
          value: {
            accessor: 'y1',
            x: 1546387200000,
            y: 10,
            mark: null,
            datum: [1546387200000, 10],
          },
        }),
      );
    });
  });
  describe('Remove points datum is not in domain', () => {
    const barSeriesSpec: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [0, 0],
        [1, 1],
        [2, 10],
        [3, 3],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const customYDomain = new Map<GroupId, DomainRange>();
    customYDomain.set(GROUP_ID, {
      max: 1,
    });
    const barSeriesDomains = computeSeriesDomains([barSeriesSpec], customYDomain, [], {
      max: 2,
    });
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: 1,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });

    test('Can render 3 bars', () => {
      const { barGeometries, indexedGeometryMap } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
      );
      expect(barGeometries.length).toBe(3);
      // will be cut by the clipping areas in the rendering component
      expect(barGeometries[2].height).toBe(1000);
      expect(indexedGeometryMap.size).toBe(3);
    });
  });
  describe('Renders minBarHeight', () => {
    const minBarHeight = 8;
    const data = [
      [1, -100000],
      [2, -10000],
      [3, -1000],
      [4, -100],
      [5, -10],
      [6, -1],
      [7, 0],
      [8, -1],
      [9, 0],
      [10, 0],
      [11, 1],
      [12, 0],
      [13, 1],
      [14, 10],
      [15, 100],
      [16, 1000],
      [17, 10000],
      [18, 100000],
    ];
    const barSeriesSpec: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data,
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      minBarHeight,
    };

    const customYDomain = new Map<GroupId, DomainRange>();
    const barSeriesDomains = computeSeriesDomains([barSeriesSpec], customYDomain);
    const xScale = computeXScale({
      xDomain: barSeriesDomains.xDomain,
      totalBarsInCluster: 1,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: barSeriesDomains.yDomain, range: [100, 0] });
    const expected = [-50, -8, -8, -8, -8, -8, 0, -8, 0, 0, 8, 0, 8, 8, 8, 8, 8, 50];

    it('should render correct heights with positive minBarHeight', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
        undefined,
        undefined,
        minBarHeight,
      );
      const barHeights = barGeometries.map(({ height }) => height);
      expect(barHeights).toEqual(expected);
    });
    it('should render correct heights with negative minBarHeight', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        LIGHT_THEME.barSeriesStyle,
        undefined,
        undefined,
        -minBarHeight,
      );
      const barHeights = barGeometries.map(({ height }) => height);
      expect(barHeights).toEqual(expected);
    });
  });
});
