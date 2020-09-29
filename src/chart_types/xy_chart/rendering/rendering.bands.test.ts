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
import { MockPointGeometry } from '../../../mocks';
import { ScaleType } from '../../../scales/constants';
import { SpecTypes } from '../../../specs/constants';
import { CurveType } from '../../../utils/curves';
import { AreaGeometry, PointGeometry } from '../../../utils/geometry';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { computeSeriesDomains } from '../state/utils/utils';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { computeXScale, computeYScales } from '../utils/scales';
import { AreaSeriesSpec, BarSeriesSpec, SeriesTypes } from '../utils/specs';
import { renderArea, renderBars } from './rendering';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering bands - areas', () => {
  describe('Empty line for missing data', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
      data: [
        [0, 2, 10],
        [1, 3, 5],
      ],
      xAccessor: 0,
      y0Accessors: [1],
      yAccessors: [2],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = [pointSeriesSpec];
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: pointSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });
    let renderedArea: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedArea = renderArea(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        { ...pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0], data: [] },
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        true,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Render geometry but empty upper and lower lines and area paths', () => {
      const {
        areaGeometry: { lines, area, color, seriesIdentifier, transform },
      } = renderedArea;
      expect(lines.length).toBe(0);
      expect(area).toBe('');
      expect(color).toBe('red');
      expect(seriesIdentifier.seriesKeys).toEqual([2]);
      expect(seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(transform).toEqual({ x: 25, y: 0 });
    });
  });
  describe('Single band area chart', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
      data: [
        [0, 2, 10],
        [1, 3, 5],
      ],
      xAccessor: 0,
      y0Accessors: [1],
      yAccessors: [2],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = [pointSeriesSpec];
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: pointSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });
    let renderedArea: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedArea = renderArea(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        true,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render upper and lower lines and area paths', () => {
      const {
        areaGeometry: { lines, area, color, seriesIdentifier, transform },
      } = renderedArea;
      expect(lines.length).toBe(2);
      expect(lines[0]).toBe('M0,0L50,50');
      expect(lines[1]).toBe('M0,80L50,70');
      expect(area).toBe('M0,0L50,50L50,70L0,80Z');
      expect(color).toBe('red');
      expect(seriesIdentifier.seriesKeys).toEqual([2]);
      expect(seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(transform).toEqual({ x: 25, y: 0 });
    });

    test('Can render two points', () => {
      const {
        areaGeometry: { points },
      } = renderedArea;
      expect(points.length).toBe(4);
      expect(points[0]).toEqual(({
        x: 0,
        y: 80,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 2,
          splitAccessors: new Map(),
          seriesKeys: [2],
          key: 'spec{spec_1}yAccessor{2}splitAccessors{}',
        },
        styleOverrides: undefined,
        value: {
          accessor: 'y0',
          x: 0,
          y: 2,
          mark: null,
          datum: [0, 2, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);

      expect(points[1]).toEqual(({
        x: 0,
        y: 0,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 2,
          splitAccessors: new Map(),
          seriesKeys: [2],
          key: 'spec{spec_1}yAccessor{2}splitAccessors{}',
        },
        styleOverrides: undefined,
        value: {
          accessor: 'y1',
          x: 0,
          y: 10,
          mark: null,
          datum: [0, 2, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[2]).toEqual(({
        x: 50,
        y: 70,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 2,
          splitAccessors: new Map(),
          seriesKeys: [2],
          key: 'spec{spec_1}yAccessor{2}splitAccessors{}',
        },
        value: {
          accessor: 'y0',
          x: 1,
          y: 3,
          mark: null,
          datum: [1, 3, 5],
        },
        styleOverrides: undefined,
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[3]).toEqual(({
        x: 50,
        y: 50,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 2,
          splitAccessors: new Map(),
          seriesKeys: [2],
          key: 'spec{spec_1}yAccessor{2}splitAccessors{}',
        },
        styleOverrides: undefined,
        value: {
          accessor: 'y1',
          x: 1,
          y: 5,
          mark: null,
          datum: [1, 3, 5],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
    });
  });
  describe('Single band area chart with null values', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
      data: [
        [0, 2, 10],
        [1, 2, null],
        [2, 3, 5],
        [3, 3, 5],
      ],
      xAccessor: 0,
      y0Accessors: [1],
      yAccessors: [2],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = [pointSeriesSpec];
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: pointSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });
    let renderedArea: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedArea = renderArea(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        true,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render upper and lower lines and area paths', () => {
      const {
        areaGeometry: { lines, area, color, seriesIdentifier, transform },
      } = renderedArea;
      expect(lines.length).toBe(2);
      expect(lines[0]).toBe('M0,0ZM50,50L75,50');
      expect(lines[1]).toBe('M0,80ZM50,70L75,70');
      expect(area).toBe('M0,0L0,80ZM50,50L75,50L75,70L50,70Z');
      expect(color).toBe('red');
      expect(seriesIdentifier.seriesKeys).toEqual([2]);
      expect(seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(transform).toEqual({ x: 25, y: 0 });
    });

    test('Can render two points', () => {
      const {
        areaGeometry: { points },
      } = renderedArea;
      expect(points.length).toBe(6);
      const getPointGeo = MockPointGeometry.fromBaseline(
        {
          x: 0,
          y: 0,
          radius: 0,
          color: 'red',
          value: {
            accessor: 'y1',
            x: 0,
            y: 10,
            mark: null,
            datum: [0, 2, 10],
          },
          transform: {
            x: 25,
            y: 0,
          },
        },
        'seriesIdentifier',
      );
      expect(points[0]).toMatchObject(
        getPointGeo({
          x: 0,
          y: 80,
          value: {
            accessor: 'y0',
            x: 0,
            y: 2,
            mark: null,
            datum: [0, 2, 10],
          },
        }),
      );
      expect(points[1]).toMatchObject(
        getPointGeo({
          value: {
            accessor: 'y1',
            x: 0,
            y: 10,
            mark: null,
            datum: [0, 2, 10],
          },
        }),
      );
      expect(points[2]).toMatchObject(
        getPointGeo({
          x: 50,
          y: 70,
          value: {
            accessor: 'y0',
            x: 2,
            y: 3,
            mark: null,
            datum: [2, 3, 5],
          },
        }),
      );
      expect(points[3]).toMatchObject(
        getPointGeo({
          x: 50,
          y: 50,
          value: {
            accessor: 'y1',
            x: 2,
            y: 5,
            mark: null,
            datum: [2, 3, 5],
          },
        }),
      );
      expect(points[4]).toMatchObject(
        getPointGeo({
          x: 75,
          y: 70,
          value: {
            accessor: 'y0',
            x: 3,
            y: 3,
            mark: null,
            datum: [3, 3, 5],
          },
        }),
      );
      expect(points[5]).toMatchObject(
        getPointGeo({
          x: 75,
          y: 50,
          value: {
            accessor: 'y1',
            x: 3,
            y: 5,
            mark: null,
            datum: [3, 3, 5],
          },
        }),
      );
    });
  });
  describe('Single series band bar chart - ordinal', () => {
    const barSeriesSpec: BarSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Bar,
      data: [
        [0, 2, 10],
        [1, 3, null],
        [2, 3, 5],
        [3, 4, 8],
      ],
      xAccessor: 0,
      y0Accessors: [1],
      yAccessors: [2],
      xScaleType: ScaleType.Ordinal,
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
      expect(barGeometries.length).toBe(3);
      expect(barGeometries[0]).toEqual({
        x: 0,
        y: 0,
        width: 25,
        height: 80,
        color: 'red',
        value: {
          accessor: 'y1',
          x: 0,
          y: 10,
          mark: null,
          datum: [0, 2, 10],
        },
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 2,
          splitAccessors: new Map(),
          seriesKeys: [2],
          key: 'spec{spec_1}yAccessor{2}splitAccessors{}',
        },
        displayValue: undefined,
        seriesStyle: {
          displayValue: {
            fill: '#777',
            fontFamily: 'sans-serif',
            fontSize: 8,
            fontStyle: 'normal',
            offsetX: 0,
            offsetY: 0,
            padding: 0,
          },
          rect: {
            opacity: 1,
          },
          rectBorder: {
            strokeWidth: 0,
            visible: false,
          },
        },
      });
      expect(barGeometries[1]).toEqual({
        x: 50,
        y: 50,
        width: 25,
        height: 20,
        color: 'red',
        value: {
          accessor: 'y1',
          x: 2,
          y: 5,
          mark: null,
          datum: [2, 3, 5],
        },
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 2,
          splitAccessors: new Map(),
          seriesKeys: [2],
          key: 'spec{spec_1}yAccessor{2}splitAccessors{}',
        },
        displayValue: undefined,
        seriesStyle: {
          displayValue: {
            fill: '#777',
            fontFamily: 'sans-serif',
            fontSize: 8,
            fontStyle: 'normal',
            offsetX: 0,
            offsetY: 0,
            padding: 0,
          },
          rect: {
            opacity: 1,
          },
          rectBorder: {
            strokeWidth: 0,
            visible: false,
          },
        },
      });
      expect(barGeometries[2]).toEqual({
        x: 75,
        y: 20,
        width: 25,
        height: 40,
        color: 'red',
        value: {
          accessor: 'y1',
          x: 3,
          y: 8,
          mark: null,
          datum: [3, 4, 8],
        },
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 2,
          splitAccessors: new Map(),
          seriesKeys: [2],
          key: 'spec{spec_1}yAccessor{2}splitAccessors{}',
        },
        displayValue: undefined,
        seriesStyle: {
          displayValue: {
            fill: '#777',
            fontFamily: 'sans-serif',
            fontSize: 8,
            fontStyle: 'normal',
            offsetX: 0,
            offsetY: 0,
            padding: 0,
          },
          rect: {
            opacity: 1,
          },
          rectBorder: {
            strokeWidth: 0,
            visible: false,
          },
        },
      });
    });
  });
});
