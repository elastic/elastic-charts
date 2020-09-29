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
import { ScaleType } from '../../../scales/constants';
import { SpecTypes } from '../../../specs/constants';
import { CurveType } from '../../../utils/curves';
import { LineGeometry, PointGeometry } from '../../../utils/geometry';
import { GroupId } from '../../../utils/ids';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { computeSeriesDomains } from '../state/utils/utils';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { computeXScale, computeYScales } from '../utils/scales';
import { LineSeriesSpec, DomainRange, SeriesTypes } from '../utils/specs';
import { renderLine } from './rendering';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering points - line', () => {
  describe('Empty line for missing data', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
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
    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        { ...pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0], data: [] },
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render the geometry without a line', () => {
      const { lineGeometry } = renderedLine;
      expect(lineGeometry.line).toBe('');
      expect(lineGeometry.color).toBe('red');
      expect(lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(lineGeometry.transform).toEqual({ x: 25, y: 0 });
    });
  });
  describe('Single series line chart - ordinal', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
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
    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render a line', () => {
      const { lineGeometry } = renderedLine;
      expect(lineGeometry.line).toBe('M0,0L50,50');
      expect(lineGeometry.color).toBe('red');
      expect(lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(lineGeometry.transform).toEqual({ x: 25, y: 0 });
    });
    test('Can render two points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = renderedLine;

      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        styleOverrides: undefined,
        value: {
          accessor: 'y1',
          x: 0,
          y: 10,
          mark: null,
          datum: [0, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 50,
        y: 50,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1,
          y: 5,
          mark: null,
          datum: [1, 5],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
  });
  describe('Multi series line chart - ordinal', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 20],
        [1, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = [pointSeriesSpec1, pointSeriesSpec2];
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: pointSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });

    let firstLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };
    let secondLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      firstLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
      secondLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });

    test('Can render two ordinal lines', () => {
      expect(firstLine.lineGeometry.line).toBe('M0,50L50,75');
      expect(firstLine.lineGeometry.color).toBe('red');
      expect(firstLine.lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstLine.lineGeometry.seriesIdentifier.specId).toEqual(spec1Id);
      expect(firstLine.lineGeometry.transform).toEqual({ x: 25, y: 0 });

      expect(secondLine.lineGeometry.line).toBe('M0,0L50,50');
      expect(secondLine.lineGeometry.color).toBe('blue');
      expect(secondLine.lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondLine.lineGeometry.seriesIdentifier.specId).toEqual(spec2Id);
      expect(secondLine.lineGeometry.transform).toEqual({ x: 25, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = firstLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual(({
        x: 0,
        y: 50,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: spec1Id,
          key: 'spec{point1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 0,
          y: 10,
          mark: null,
          datum: [0, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 50,
        y: 75,
        color: 'red',
        radius: 0,
        seriesIdentifier: {
          specId: spec1Id,
          key: 'spec{point1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1,
          y: 5,
          mark: null,
          datum: [1, 5],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = secondLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        color: 'blue',
        radius: 0,
        seriesIdentifier: {
          specId: spec2Id,
          key: 'spec{point2}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 0,
          y: 20,
          mark: null,
          datum: [0, 20],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 50,
        y: 50,
        color: 'blue',
        radius: 0,
        seriesIdentifier: {
          specId: spec2Id,
          key: 'spec{point2}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1,
          y: 10,
          mark: null,
          datum: [1, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
  });
  describe('Single series line chart - linear', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
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

    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render a linear line', () => {
      expect(renderedLine.lineGeometry.line).toBe('M0,0L100,50');
      expect(renderedLine.lineGeometry.color).toBe('red');
      expect(renderedLine.lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedLine.lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = renderedLine;
      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        color: 'red',
        radius: 0,
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 0,
          y: 10,
          mark: null,
          datum: [0, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 100,
        y: 50,
        color: 'red',
        radius: 0,
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1,
          y: 5,
          mark: null,
          datum: [1, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
  });
  describe('Multi series line chart - linear', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 20],
        [1, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = [pointSeriesSpec1, pointSeriesSpec2];
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: pointSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });

    let firstLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };
    let secondLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      firstLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
      secondLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('can render two linear lines', () => {
      expect(firstLine.lineGeometry.line).toBe('M0,50L100,75');
      expect(firstLine.lineGeometry.color).toBe('red');
      expect(firstLine.lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstLine.lineGeometry.seriesIdentifier.specId).toEqual(spec1Id);
      expect(firstLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });

      expect(secondLine.lineGeometry.line).toBe('M0,0L100,50');
      expect(secondLine.lineGeometry.color).toBe('blue');
      expect(secondLine.lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondLine.lineGeometry.seriesIdentifier.specId).toEqual(spec2Id);
      expect(secondLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = firstLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual(({
        x: 0,
        y: 50,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: spec1Id,
          key: 'spec{point1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 0,
          y: 10,
          mark: null,
          datum: [0, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 100,
        y: 75,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: spec1Id,
          key: 'spec{point1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1,
          y: 5,
          mark: null,
          datum: [1, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = secondLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        color: 'blue',
        radius: 0,
        seriesIdentifier: {
          specId: spec2Id,
          key: 'spec{point2}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 0,
          y: 20,
          mark: null,
          datum: [0, 20],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 100,
        y: 50,
        color: 'blue',
        radius: 0,
        seriesIdentifier: {
          specId: spec2Id,
          key: 'spec{point2}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1,
          y: 10,
          mark: null,
          datum: [1, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
  });
  describe('Single series line chart - time', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [1546300800000, 10],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
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

    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render a time line', () => {
      expect(renderedLine.lineGeometry.line).toBe('M0,0L100,50');
      expect(renderedLine.lineGeometry.color).toBe('red');
      expect(renderedLine.lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedLine.lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = renderedLine;
      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1546300800000,
          y: 10,
          mark: null,
          datum: [1546300800000, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 100,
        y: 50,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1546387200000,
          y: 5,
          mark: null,
          datum: [1546387200000, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
  });
  describe('Multi series line chart - time', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [1546300800000, 10],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [1546300800000, 20],
        [1546387200000, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = [pointSeriesSpec1, pointSeriesSpec2];
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: pointSeriesMap.length,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });

    let firstLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };
    let secondLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      firstLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
      secondLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('can render first spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = firstLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual(({
        x: 0,
        y: 50,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: spec1Id,
          key: 'spec{point1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1546300800000,
          y: 10,
          mark: null,
          datum: [1546300800000, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 100,
        y: 75,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: spec1Id,
          key: 'spec{point1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1546387200000,
          y: 5,
          mark: null,
          datum: [1546387200000, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = secondLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        radius: 0,
        color: 'blue',
        seriesIdentifier: {
          specId: spec2Id,
          key: 'spec{point2}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1546300800000,
          y: 20,
          mark: null,
          datum: [1546300800000, 20],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 100,
        y: 50,
        radius: 0,
        color: 'blue',
        seriesIdentifier: {
          specId: spec2Id,
          key: 'spec{point2}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1546387200000,
          y: 10,
          mark: null,
          datum: [1546387200000, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(indexedGeometryMap.size).toEqual(points.length);
    });
  });
  describe('Single series line chart - y log', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 10],
        [1, 5],
        [2, null],
        [3, 5],
        [4, 5],
        [5, 0],
        [6, 10],
        [7, 10],
        [8, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Log,
    };
    const pointSeriesMap = [pointSeriesSpec];
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: pointSeriesMap.length,
      range: [0, 90],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });

    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render a splitted line', () => {
      // expect(renderedLine.lineGeometry.line).toBe('ss');
      expect(renderedLine.lineGeometry.line.split('M').length - 1).toBe(3);
      expect(renderedLine.lineGeometry.color).toBe('red');
      expect(renderedLine.lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedLine.lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = renderedLine;
      // all the points minus the undefined ones on a log scale
      expect(points.length).toBe(7);
      // all the points expect null geometries
      expect(indexedGeometryMap.size).toEqual(8);
      const nullIndexdGeometry = indexedGeometryMap.find(2)!;
      expect(nullIndexdGeometry).toEqual([]);

      const zeroValueIndexdGeometry = indexedGeometryMap.find(5)!;
      expect(zeroValueIndexdGeometry).toBeDefined();
      expect(zeroValueIndexdGeometry.length).toBe(1);
      // moved to the bottom of the chart
      expect((zeroValueIndexdGeometry[0] as PointGeometry).y).toBe(100);
      // 0 radius point
      expect((zeroValueIndexdGeometry[0] as PointGeometry).radius).toBe(0);
    });
  });
  describe('Remove points datum is not in domain', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
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
    const pointSeriesDomains = computeSeriesDomains([pointSeriesSpec], customYDomain, [], {
      max: 2,
    });
    const xScale = computeXScale({
      xDomain: pointSeriesDomains.xDomain,
      totalBarsInCluster: 1,
      range: [0, 100],
    });
    const yScales = computeYScales({ yDomains: pointSeriesDomains.yDomain, range: [100, 0] });
    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render two points', () => {
      const {
        lineGeometry: { points },
        indexedGeometryMap,
      } = renderedLine;
      // will not render the 3rd point that is out of y domain
      expect(points.length).toBe(2);
      // will keep the 3rd point as an indexedGeometry
      expect(indexedGeometryMap.size).toEqual(3);
      expect(points[0]).toEqual(({
        x: 0,
        y: 100,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 0,
          y: 0,
          mark: null,
          datum: [0, 0],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
      expect(points[1]).toEqual(({
        x: 50,
        y: 0,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
        },
        value: {
          accessor: 'y1',
          x: 1,
          y: 1,
          mark: null,
          datum: [1, 1],
        },
        transform: {
          x: 25,
          y: 0,
        },
      } as unknown) as PointGeometry);
    });
  });

  describe('Error guards for scaled values', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Line,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
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
    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.lineSeriesStyle,
        {
          enabled: false,
        },
      );
    });

    describe('xScale values throw error', () => {
      beforeAll(() => {
        jest.spyOn(xScale, 'scaleOrThrow').mockImplementation(() => {
          throw new Error();
        });
      });

      it('Should have empty line', () => {
        const { lineGeometry } = renderedLine;
        expect(lineGeometry.line).toBe('');
        expect(lineGeometry.color).toBe('red');
        expect(lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
        expect(lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
        expect(lineGeometry.transform).toEqual({ x: 25, y: 0 });
      });
    });

    describe('yScale values throw error', () => {
      beforeAll(() => {
        jest.spyOn(yScales.get(GROUP_ID)!, 'scaleOrThrow').mockImplementation(() => {
          throw new Error();
        });
      });

      it('Should have empty line', () => {
        const { lineGeometry } = renderedLine;
        expect(lineGeometry.line).toBe('');
        expect(lineGeometry.color).toBe('red');
        expect(lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
        expect(lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
        expect(lineGeometry.transform).toEqual({ x: 25, y: 0 });
      });
    });
  });
});
