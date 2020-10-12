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
import { MockSeriesSpec } from '../../../mocks/specs';
import { ScaleType } from '../../../scales/constants';
import { SpecTypes } from '../../../specs/constants';
import { CurveType } from '../../../utils/curves';
import { PointGeometry, AreaGeometry } from '../../../utils/geometry';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { computeSeriesDomains } from '../state/utils/utils';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { computeXScale, computeYScales } from '../utils/scales';
import { AreaSeriesSpec, SeriesTypes, StackMode } from '../utils/specs';
import { renderArea } from './rendering';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering points - areas', () => {
  describe('Empty line for missing data', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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
    const yScales = computeYScales({
      yDomains: pointSeriesDomains.yDomain,
      range: [100, 0],
    });
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
        false,
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
      expect(seriesIdentifier.seriesKeys).toEqual([1]);
      expect(seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(transform).toEqual({ x: 25, y: 0 });
    });
  });
  describe('Single series area chart - ordinal', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render an line and area paths', () => {
      const {
        areaGeometry: { lines, area, color, seriesIdentifier, transform },
      } = renderedArea;
      expect(lines[0]).toBe('M0,0L50,50');
      expect(area).toBe('M0,0L50,50L50,100L0,100Z');
      expect(color).toBe('red');
      expect(seriesIdentifier.seriesKeys).toEqual([1]);
      expect(seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(transform).toEqual({ x: 25, y: 0 });
    });

    test('Can render two points', () => {
      const {
        areaGeometry: { points },
        indexedGeometryMap,
      } = renderedArea;

      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
  describe('Multi series area chart - ordinal', () => {
    const spec1Id = 'spec_1';
    const spec2Id = 'spec_2';
    const pointSeriesSpec1: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };
    let secondLine: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      firstLine = renderArea(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
      secondLine = renderArea(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });

    test('Can render two ordinal areas', () => {
      expect(firstLine.areaGeometry.lines[0]).toBe('M0,50L50,75');
      expect(firstLine.areaGeometry.area).toBe('M0,50L50,75L50,100L0,100Z');
      expect(firstLine.areaGeometry.color).toBe('red');
      expect(firstLine.areaGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstLine.areaGeometry.seriesIdentifier.specId).toEqual(spec1Id);
      expect(firstLine.areaGeometry.transform).toEqual({ x: 25, y: 0 });

      expect(secondLine.areaGeometry.lines[0]).toBe('M0,0L50,50');
      expect(secondLine.areaGeometry.area).toBe('M0,0L50,50L50,100L0,100Z');
      expect(secondLine.areaGeometry.color).toBe('blue');
      expect(secondLine.areaGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondLine.areaGeometry.seriesIdentifier.specId).toEqual(spec2Id);
      expect(secondLine.areaGeometry.transform).toEqual({ x: 25, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        areaGeometry: { points },
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
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
        y: 75,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: spec1Id,
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
        areaGeometry: { points },
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_2}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
        radius: 0,
        color: 'blue',
        seriesIdentifier: {
          specId: spec2Id,
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_2}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
  describe('Single series area chart - linear', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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

    let renderedArea: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedArea = renderArea(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render a linear area', () => {
      expect(renderedArea.areaGeometry.lines[0]).toBe('M0,0L100,50');
      expect(renderedArea.areaGeometry.area).toBe('M0,0L100,50L100,100L0,100Z');
      expect(renderedArea.areaGeometry.color).toBe('red');
      expect(renderedArea.areaGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedArea.areaGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedArea.areaGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        areaGeometry: { points },
        indexedGeometryMap,
      } = renderedArea;
      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
  describe('Multi series area chart - linear', () => {
    const spec1Id = 'spec_1';
    const spec2Id = 'spec_2';
    const pointSeriesSpec1: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };
    let secondLine: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      firstLine = renderArea(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
      secondLine = renderArea(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('can render two linear areas', () => {
      expect(firstLine.areaGeometry.lines[0]).toBe('M0,50L100,75');
      expect(firstLine.areaGeometry.area).toBe('M0,50L100,75L100,100L0,100Z');
      expect(firstLine.areaGeometry.color).toBe('red');
      expect(firstLine.areaGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstLine.areaGeometry.seriesIdentifier.specId).toEqual(spec1Id);
      expect(firstLine.areaGeometry.transform).toEqual({ x: 0, y: 0 });

      expect(secondLine.areaGeometry.lines[0]).toBe('M0,0L100,50');
      expect(secondLine.areaGeometry.area).toBe('M0,0L100,50L100,100L0,100Z');
      expect(secondLine.areaGeometry.color).toBe('blue');
      expect(secondLine.areaGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondLine.areaGeometry.seriesIdentifier.specId).toEqual(spec2Id);
      expect(secondLine.areaGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        areaGeometry: { points },
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
        areaGeometry: { points },
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_2}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
        radius: 0,
        color: 'blue',
        seriesIdentifier: {
          specId: spec2Id,
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_2}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
  describe('Single series area chart - time', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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

    let renderedArea: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedArea = renderArea(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render a time area', () => {
      expect(renderedArea.areaGeometry.lines[0]).toBe('M0,0L100,50');
      expect(renderedArea.areaGeometry.area).toBe('M0,0L100,50L100,100L0,100Z');
      expect(renderedArea.areaGeometry.color).toBe('red');
      expect(renderedArea.areaGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedArea.areaGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedArea.areaGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        areaGeometry: { points },
        indexedGeometryMap,
      } = renderedArea;
      expect(points[0]).toEqual(({
        x: 0,
        y: 0,
        radius: 0,
        color: 'red',
        seriesIdentifier: {
          specId: SPEC_ID,
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
  describe('Multi series area chart - time', () => {
    const spec1Id = 'spec_1';
    const spec2Id = 'spec_2';
    const pointSeriesSpec1: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
      data: [
        [1546300800000, 10],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };
    let secondLine: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      firstLine = renderArea(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
      secondLine = renderArea(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1],
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('can render first spec points', () => {
      const {
        areaGeometry: { points },
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_1}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
        areaGeometry: { points },
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_2}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
          yAccessor: 1,
          splitAccessors: new Map(),
          seriesKeys: [1],
          key: 'spec{spec_2}yAccessor{1}splitAccessors{}',
        },
        styleOverrides: undefined,
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
  describe('Single series area chart - y log', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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

    let renderedArea: {
      areaGeometry: AreaGeometry;
      indexedGeometryMap: IndexedGeometryMap;
    };

    beforeEach(() => {
      renderedArea = renderArea(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0],
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
        {
          enabled: false,
        },
      );
    });
    test('Can render a splitted area and line', () => {
      // expect(renderedArea.lineGeometry.line).toBe('ss');
      expect(renderedArea.areaGeometry.lines[0].split('M').length - 1).toBe(3);
      expect(renderedArea.areaGeometry.area.split('M').length - 1).toBe(3);
      expect(renderedArea.areaGeometry.color).toBe('red');
      expect(renderedArea.areaGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedArea.areaGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedArea.areaGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render points', () => {
      const {
        areaGeometry: { points },
        indexedGeometryMap,
      } = renderedArea;
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
      expect(zeroValueIndexdGeometry[0].y).toBe(100);
      // 0 radius point
      expect((zeroValueIndexdGeometry[0] as PointGeometry).radius).toBe(0);
    });
  });
  it('Stacked areas with 0 values', () => {
    const pointSeriesSpec1: AreaSeriesSpec = MockSeriesSpec.area({
      id: 'spec_1',
      data: [
        [1546300800000, 0],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
      stackAccessors: [0],
      stackMode: StackMode.Percentage,
    });
    const pointSeriesSpec2: AreaSeriesSpec = MockSeriesSpec.area({
      id: 'spec_2',
      data: [
        [1546300800000, 0],
        [1546387200000, 2],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
      stackAccessors: [0],
      stackMode: StackMode.Percentage,
    });
    const pointSeriesDomains = computeSeriesDomains([pointSeriesSpec1, pointSeriesSpec2]);
    expect(pointSeriesDomains.formattedDataSeries.stacked[0].dataSeries[0].data).toMatchObject([
      {
        datum: [1546300800000, 0],
        initialY0: null,
        initialY1: 0,
        x: 1546300800000,
        y0: 0,
        y1: 0,
        mark: null,
      },
      {
        datum: [1546387200000, 5],
        initialY0: null,
        initialY1: 5,
        x: 1546387200000,
        y0: 0,
        y1: 0.7142857142857143,
        mark: null,
      },
    ]);
  });
  it('Stacked areas with null values', () => {
    const pointSeriesSpec1: AreaSeriesSpec = MockSeriesSpec.area({
      id: 'spec_1',
      data: [
        [1546300800000, null],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
      stackAccessors: [0],
    });
    const pointSeriesSpec2: AreaSeriesSpec = MockSeriesSpec.area({
      id: 'spec_2',
      data: [
        [1546300800000, 3],
        [1546387200000, null],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
      stackAccessors: [0],
    });
    const pointSeriesDomains = computeSeriesDomains([pointSeriesSpec1, pointSeriesSpec2]);
    expect(pointSeriesDomains.formattedDataSeries.stacked[0].dataSeries[0].data).toMatchObject([
      {
        datum: [1546300800000, null],
        initialY0: null,
        initialY1: null,
        x: 1546300800000,
        y0: 0,
        y1: 0,
        mark: null,
      },
      {
        datum: [1546387200000, 5],
        initialY0: null,
        initialY1: 5,
        x: 1546387200000,
        y0: 0,
        y1: 5,
        mark: null,
      },
    ]);

    expect(pointSeriesDomains.formattedDataSeries.stacked[0].dataSeries[1].data).toEqual([
      {
        datum: [1546300800000, 3],
        initialY0: null,
        initialY1: 3,
        x: 1546300800000,
        y0: 0,
        y1: 3,
        mark: null,
      },
      {
        datum: [1546387200000, null],
        initialY0: null,
        initialY1: null,
        x: 1546387200000,
        y0: 5,
        y1: 5,
        mark: null,
      },
    ]);
  });

  describe('Error guards for scaled values', () => {
    const pointSeriesSpec: AreaSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: SeriesTypes.Area,
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
        false,
        0,
        LIGHT_THEME.areaSeriesStyle,
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

      test('Should include no lines nor area', () => {
        const {
          areaGeometry: { lines, area, color, seriesIdentifier, transform },
        } = renderedArea;
        expect(lines).toHaveLength(0);
        expect(area).toBe('');
        expect(color).toBe('red');
        expect(seriesIdentifier.seriesKeys).toEqual([1]);
        expect(seriesIdentifier.specId).toEqual(SPEC_ID);
        expect(transform).toEqual({ x: 25, y: 0 });
      });
    });

    describe('yScale values throw error', () => {
      beforeAll(() => {
        jest.spyOn(yScales.get(GROUP_ID)!, 'scaleOrThrow').mockImplementation(() => {
          throw new Error();
        });
      });

      test('Should include no lines nor area', () => {
        const {
          areaGeometry: { lines, area, color, seriesIdentifier, transform },
        } = renderedArea;
        expect(lines).toHaveLength(0);
        expect(area).toBe('');
        expect(color).toBe('red');
        expect(seriesIdentifier.seriesKeys).toEqual([1]);
        expect(seriesIdentifier.specId).toEqual(SPEC_ID);
        expect(transform).toEqual({ x: 25, y: 0 });
      });
    });
  });
});
