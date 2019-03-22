import { computeSeriesDomains } from '../../state/utils';
import { getGroupId, getSpecId } from '../utils/ids';
import { ScaleType } from '../utils/scales/scales';
import { CurveType } from './curves';
import { IndexedGeometry, LineGeometry, renderLine } from './rendering';
import { computeXScale, computeYScales } from './scales';
import { LineSeriesSpec } from './specs';
const SPEC_ID = getSpecId('spec_1');
const GROUP_ID = getGroupId('group_1');

describe('Rendering points - line', () => {
  describe('Single series point chart - ordinal', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[0, 10], [1, 5]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = new Map();
    pointSeriesMap.set(SPEC_ID, pointSeriesSpec);
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale(pointSeriesDomains.xDomain, pointSeriesMap.size, 0, 100);
    const yScales = computeYScales(pointSeriesDomains.yDomain, 100, 0);
    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        SPEC_ID,
        [],
      );
    });
    test('Can render a line', () => {
      const { lineGeometry } = renderedLine;
      expect(lineGeometry.line).toBe('M0,0L50,50');
      expect(lineGeometry.color).toBe('red');
      expect(lineGeometry.geometryId.seriesKey).toEqual([]);
      expect(lineGeometry.geometryId.specId).toEqual(SPEC_ID);
      expect(lineGeometry.transform).toEqual({ x: 25, y: 0 });
    });
    test('Can render two points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = renderedLine;

      expect(points[0]).toEqual({
        x: 0,
        y: 0,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [0, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 50,
        y: 50,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [1, 5],
        },
        transform: {
          x: 25,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
  });
  describe('Multi series pointchart - ordinal', () => {
    const spec1Id = getSpecId('point1');
    const spec2Id = getSpecId('point2');
    const pointSeriesSpec1: LineSeriesSpec = {
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[0, 10], [1, 5]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: LineSeriesSpec = {
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[0, 20], [1, 10]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = new Map();
    pointSeriesMap.set(spec1Id, pointSeriesSpec1);
    pointSeriesMap.set(spec2Id, pointSeriesSpec2);
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale(pointSeriesDomains.xDomain, pointSeriesMap.size, 0, 100);
    const yScales = computeYScales(pointSeriesDomains.yDomain, 100, 0);

    let firstLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };
    let secondLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };

    beforeEach(() => {
      firstLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        spec1Id,
        [],
      );
      secondLine = renderLine(
        25, // adding a ideal 25px shift, generally applied by renderGeometries
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        spec2Id,
        [],
      );
    });

    test('Can render two ordinal lines', () => {
      expect(firstLine.lineGeometry.line).toBe('M0,50L50,75');
      expect(firstLine.lineGeometry.color).toBe('red');
      expect(firstLine.lineGeometry.geometryId.seriesKey).toEqual([]);
      expect(firstLine.lineGeometry.geometryId.specId).toEqual(spec1Id);
      expect(firstLine.lineGeometry.transform).toEqual({ x: 25, y: 0 });

      expect(secondLine.lineGeometry.line).toBe('M0,0L50,50');
      expect(secondLine.lineGeometry.color).toBe('blue');
      expect(secondLine.lineGeometry.geometryId.seriesKey).toEqual([]);
      expect(secondLine.lineGeometry.geometryId.specId).toEqual(spec2Id);
      expect(secondLine.lineGeometry.transform).toEqual({ x: 25, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = firstLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual({
        x: 0,
        y: 50,
        color: 'red',
        value: {
          specId: spec1Id,
          seriesKey: [],
          datum: [0, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 50,
        y: 75,
        color: 'red',
        value: {
          specId: spec1Id,
          seriesKey: [],
          datum: [1, 5],
        },
        transform: {
          x: 25,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = secondLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual({
        x: 0,
        y: 0,
        color: 'blue',
        value: {
          specId: spec2Id,
          seriesKey: [],
          datum: [0, 20],
        },
        transform: {
          x: 25,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 50,
        y: 50,
        color: 'blue',
        value: {
          specId: spec2Id,
          seriesKey: [],
          datum: [1, 10],
        },
        transform: {
          x: 25,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
  });
  describe('Single series pointchart - linear', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[0, 10], [1, 5]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = new Map();
    pointSeriesMap.set(SPEC_ID, pointSeriesSpec);
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale(pointSeriesDomains.xDomain, pointSeriesMap.size, 0, 100);
    const yScales = computeYScales(pointSeriesDomains.yDomain, 100, 0);

    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        SPEC_ID,
        [],
      );
    });
    test('Can render a linear line', () => {
      expect(renderedLine.lineGeometry.line).toBe('M0,0L100,50');
      expect(renderedLine.lineGeometry.color).toBe('red');
      expect(renderedLine.lineGeometry.geometryId.seriesKey).toEqual([]);
      expect(renderedLine.lineGeometry.geometryId.specId).toEqual(SPEC_ID);
      expect(renderedLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = renderedLine;
      expect(points[0]).toEqual({
        x: 0,
        y: 0,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [0, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 100,
        y: 50,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [1, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
  });
  describe('Multi series pointchart - linear', () => {
    const spec1Id = getSpecId('point1');
    const spec2Id = getSpecId('point2');
    const pointSeriesSpec1: LineSeriesSpec = {
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[0, 10], [1, 5]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: LineSeriesSpec = {
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[0, 20], [1, 10]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = new Map();
    pointSeriesMap.set(spec1Id, pointSeriesSpec1);
    pointSeriesMap.set(spec2Id, pointSeriesSpec2);
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale(pointSeriesDomains.xDomain, pointSeriesMap.size, 0, 100);
    const yScales = computeYScales(pointSeriesDomains.yDomain, 100, 0);

    let firstLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };
    let secondLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };

    beforeEach(() => {
      firstLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        spec1Id,
        [],
      );
      secondLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        spec2Id,
        [],
      );
    });
    test('can render two linear lines', () => {
      expect(firstLine.lineGeometry.line).toBe('M0,50L100,75');
      expect(firstLine.lineGeometry.color).toBe('red');
      expect(firstLine.lineGeometry.geometryId.seriesKey).toEqual([]);
      expect(firstLine.lineGeometry.geometryId.specId).toEqual(spec1Id);
      expect(firstLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });

      expect(secondLine.lineGeometry.line).toBe('M0,0L100,50');
      expect(secondLine.lineGeometry.color).toBe('blue');
      expect(secondLine.lineGeometry.geometryId.seriesKey).toEqual([]);
      expect(secondLine.lineGeometry.geometryId.specId).toEqual(spec2Id);
      expect(secondLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = firstLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual({
        x: 0,
        y: 50,
        color: 'red',
        value: {
          specId: spec1Id,
          seriesKey: [],
          datum: [0, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 100,
        y: 75,
        color: 'red',
        value: {
          specId: spec1Id,
          seriesKey: [],
          datum: [1, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = secondLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual({
        x: 0,
        y: 0,
        color: 'blue',
        value: {
          specId: spec2Id,
          seriesKey: [],
          datum: [0, 20],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 100,
        y: 50,
        color: 'blue',
        value: {
          specId: spec2Id,
          seriesKey: [],
          datum: [1, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
  });
  describe('Single series pointchart - time', () => {
    const pointSeriesSpec: LineSeriesSpec = {
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[1546300800000, 10], [1546387200000, 5]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = new Map();
    pointSeriesMap.set(SPEC_ID, pointSeriesSpec);
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale(pointSeriesDomains.xDomain, pointSeriesMap.size, 0, 100);
    const yScales = computeYScales(pointSeriesDomains.yDomain, 100, 0);

    let renderedLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };

    beforeEach(() => {
      renderedLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        SPEC_ID,
        [],
      );
    });
    test('Can render a time line', () => {
      expect(renderedLine.lineGeometry.line).toBe('M0,0L100,50');
      expect(renderedLine.lineGeometry.color).toBe('red');
      expect(renderedLine.lineGeometry.geometryId.seriesKey).toEqual([]);
      expect(renderedLine.lineGeometry.geometryId.specId).toEqual(SPEC_ID);
      expect(renderedLine.lineGeometry.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = renderedLine;
      expect(points[0]).toEqual({
        x: 0,
        y: 0,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [1546300800000, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 100,
        y: 50,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [1546387200000, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
  });
  describe('Multi series pointchart - time', () => {
    const spec1Id = getSpecId('point1');
    const spec2Id = getSpecId('point2');
    const pointSeriesSpec1: LineSeriesSpec = {
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[1546300800000, 10], [1546387200000, 5]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesSpec2: LineSeriesSpec = {
      id: spec2Id,
      groupId: GROUP_ID,
      seriesType: 'line',
      yScaleToDataExtent: false,
      data: [[1546300800000, 20], [1546387200000, 10]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    };
    const pointSeriesMap = new Map();
    pointSeriesMap.set(spec1Id, pointSeriesSpec1);
    pointSeriesMap.set(spec2Id, pointSeriesSpec2);
    const pointSeriesDomains = computeSeriesDomains(pointSeriesMap, new Map());
    const xScale = computeXScale(pointSeriesDomains.xDomain, pointSeriesMap.size, 0, 100);
    const yScales = computeYScales(pointSeriesDomains.yDomain, 100, 0);

    let firstLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };
    let secondLine: {
      lineGeometry: LineGeometry;
      indexedGeometries: Map<any, IndexedGeometry[]>;
    };

    beforeEach(() => {
      firstLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        CurveType.LINEAR,
        spec1Id,
        [],
      );
      secondLine = renderLine(
        0, // not applied any shift, renderGeometries applies it only with mixed charts
        pointSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[1].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'blue',
        CurveType.LINEAR,
        spec2Id,
        [],
      );
    });
    test('can render first spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = firstLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual({
        x: 0,
        y: 50,
        color: 'red',
        value: {
          specId: spec1Id,
          seriesKey: [],
          datum: [1546300800000, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 100,
        y: 75,
        color: 'red',
        value: {
          specId: spec1Id,
          seriesKey: [],
          datum: [1546387200000, 5],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        lineGeometry: { points },
        indexedGeometries,
      } = secondLine;
      expect(points.length).toEqual(2);
      expect(points[0]).toEqual({
        x: 0,
        y: 0,
        color: 'blue',
        value: {
          specId: spec2Id,
          seriesKey: [],
          datum: [1546300800000, 20],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(points[1]).toEqual({
        x: 100,
        y: 50,
        color: 'blue',
        value: {
          specId: spec2Id,
          seriesKey: [],
          datum: [1546387200000, 10],
        },
        transform: {
          x: 0,
          y: 0,
        },
      });
      expect(indexedGeometries.size).toEqual(points.length);
    });
  });
});
