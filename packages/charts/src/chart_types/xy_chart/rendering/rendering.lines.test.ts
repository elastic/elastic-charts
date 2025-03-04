/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import type { ScaleContinuousType } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import type { PointGeometry } from '../../../utils/geometry';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { computeSeriesGeometriesSelector } from '../state/selectors/compute_series_geometries';
import { SeriesType } from '../utils/specs';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering points - line', () => {
  describe('Single series line chart - ordinal', () => {
    const pointSeriesSpec = MockSeriesSpec.line({
      id: SPEC_ID,
      groupId: GROUP_ID,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    });
    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red'] } } });
    MockStore.addSpecs([pointSeriesSpec, settings], store);
    const {
      geometries: { lines },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render a line', () => {
      const { value: lineGeometry } = lines[0]!;
      expect(lineGeometry.line).toBe('M0,0L50,50');
      expect(lineGeometry.color).toBe('red');
      expect(lineGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(lineGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(lineGeometry.transform).toEqual({ x: 25, y: 0 });
    });
    test('Can render two points', () => {
      const {
        value: { points },
      } = lines[0]!;

      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Multi series line chart - ordinal', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1 = MockSeriesSpec.line({
      id: spec1Id,
      groupId: GROUP_ID,
      seriesType: SeriesType.Line,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    });
    const pointSeriesSpec2 = MockSeriesSpec.line({
      id: spec2Id,
      groupId: GROUP_ID,
      data: [
        [0, 20],
        [1, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    });

    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([pointSeriesSpec1, pointSeriesSpec2, settings], store);
    const {
      geometries: { lines },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render two ordinal lines', () => {
      const { value: firstLine } = lines[0]!;
      const { value: secondLine } = lines[1]!;
      expect(firstLine.color).toBe('red');
      expect(firstLine.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstLine.seriesIdentifier.specId).toEqual(spec1Id);
      expect(firstLine.transform).toEqual({ x: 25, y: 0 });

      expect(secondLine.line).toBe('M0,0L50,50');
      expect(secondLine.color).toBe('blue');
      expect(secondLine.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondLine.seriesIdentifier.specId).toEqual(spec2Id);
      expect(secondLine.transform).toEqual({ x: 25, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        value: { points },
      } = lines[0]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        value: { points },
      } = lines[1]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Single series line chart - linear', () => {
    const pointSeriesSpec = MockSeriesSpec.line({
      id: SPEC_ID,
      groupId: GROUP_ID,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    });

    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([pointSeriesSpec, settings], store);
    const {
      geometries: { lines },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render a linear line', () => {
      const { value: renderedLine } = lines[0]!;
      expect(renderedLine.line).toBe('M0,0L100,50');
      expect(renderedLine.color).toBe('red');
      expect(renderedLine.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedLine.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedLine.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        value: { points },
      } = lines[0]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Multi series line chart - linear', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1 = MockSeriesSpec.line({
      id: spec1Id,
      groupId: GROUP_ID,
      data: [
        [0, 10],
        [1, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    });
    const pointSeriesSpec2 = MockSeriesSpec.line({
      id: spec2Id,
      groupId: GROUP_ID,
      data: [
        [0, 20],
        [1, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    });
    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([pointSeriesSpec1, pointSeriesSpec2, settings], store);
    const {
      geometries: { lines },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('can render two linear lines', () => {
      const { value: firstLine } = lines[0]!;
      const { value: secondLine } = lines[1]!;
      expect(firstLine.line).toBe('M0,50L100,75');
      expect(firstLine.color).toBe('red');
      expect(firstLine.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstLine.seriesIdentifier.specId).toEqual(spec1Id);
      expect(firstLine.transform).toEqual({ x: 0, y: 0 });

      expect(secondLine.line).toBe('M0,0L100,50');
      expect(secondLine.color).toBe('blue');
      expect(secondLine.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondLine.seriesIdentifier.specId).toEqual(spec2Id);
      expect(secondLine.transform).toEqual({ x: 0, y: 0 });
    });
    test('can render first spec points', () => {
      const {
        value: { points },
      } = lines[0]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        value: { points },
      } = lines[1]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Single series line chart - time', () => {
    const pointSeriesSpec = MockSeriesSpec.line({
      id: SPEC_ID,
      groupId: GROUP_ID,
      data: [
        [1546300800000, 10],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    });

    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([pointSeriesSpec, settings], store);
    const {
      geometries: { lines },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render a time line', () => {
      const { value: renderedLine } = lines[0]!;
      expect(renderedLine.line).toBe('M0,0L100,50');
      expect(renderedLine.color).toBe('red');
      expect(renderedLine.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedLine.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedLine.transform).toEqual({ x: 0, y: 0 });
    });
    test('Can render two points', () => {
      const {
        value: { points },
      } = lines[0]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Multi series line chart - time', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1 = MockSeriesSpec.line({
      id: spec1Id,
      groupId: GROUP_ID,
      data: [
        [1546300800000, 10],
        [1546387200000, 5],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    });
    const pointSeriesSpec2 = MockSeriesSpec.line({
      id: spec2Id,
      groupId: GROUP_ID,
      data: [
        [1546300800000, 20],
        [1546387200000, 10],
      ],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
    });
    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([pointSeriesSpec1, pointSeriesSpec2, settings], store);
    const {
      geometries: {
        lines: [firstLine, secondLine],
      },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('can render first spec points', () => {
      const {
        value: { points },
      } = firstLine!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
    test('can render second spec points', () => {
      const {
        value: { points },
      } = secondLine!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Single series line chart - y log', () => {
    const pointSeriesSpec = MockSeriesSpec.line({
      id: SPEC_ID,
      groupId: GROUP_ID,
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
    });
    const store = MockStore.default({ width: 90, height: 100, top: 0, left: 0 });
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([pointSeriesSpec, settings], store);
    const {
      geometries: { lines },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('should render a split line', () => {
      const { value: renderedLine } = lines[0]!;
      expect(renderedLine.line.split('M').length - 1).toBe(3);
      expect(renderedLine.color).toBe('red');
      expect(renderedLine.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedLine.seriesIdentifier.specId).toEqual(SPEC_ID);
      expect(renderedLine.transform).toEqual({ x: 0, y: 0 });
    });
    test('should render points', () => {
      const {
        value: { points },
      } = lines[0]!;
      // all the points minus the undefined ones on a log scale
      expect(points.length).toBe(7);
      // all the points including null geometries
      expect(geometriesIndex.size).toEqual(9);
      const nullIndexdGeometry = geometriesIndex.find(2, 10);
      expect(nullIndexdGeometry).toHaveLength(1);

      const zeroValueIndexdGeometry = geometriesIndex.find(5, 10);
      expect(zeroValueIndexdGeometry).toBeDefined();
      expect(zeroValueIndexdGeometry.length).toBe(1);
      // the zero value is scaled to NaN
      expect((zeroValueIndexdGeometry[0] as PointGeometry).y).toBe(NaN);
      expect((zeroValueIndexdGeometry[0] as PointGeometry).radius).toBe(LIGHT_THEME.lineSeriesStyle.point.radius);
    });
  });
  describe('Removing out-of-domain points', () => {
    const pointSeriesSpec = MockSeriesSpec.line({
      id: SPEC_ID,
      // groupId: GROUP_ID,
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
    });
    const settings = MockGlobalSpec.settingsNoMargins({
      xDomain: { max: 2 },
      theme: { colors: { vizColors: ['red', 'blue'] } },
    });
    const axis = MockGlobalSpec.yAxis({ hide: true, domain: { max: 1 } });
    const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
    MockStore.addSpecs([pointSeriesSpec, axis, settings], store);

    const {
      geometries: { lines },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());
    test('should render 3 points', () => {
      const {
        value: { points },
      } = lines[0]!;
      // will not render the 4th point is out of the x domain, will not keep the 3rd point which is out of the y Domain
      expect(points.length).toBe(2);
      // will keep the 3rd point as an indexedGeometry
      expect(geometriesIndex.size).toEqual(3);
      expect(points).toMatchSnapshot();
    });
  });

  describe('polarity', () => {
    let polarity = 1;
    let points: PointGeometry[] = [];
    let yScaleType: ScaleContinuousType = ScaleType.Linear;

    beforeEach(() => {
      const pointSeriesSpec = MockSeriesSpec.line({
        id: SPEC_ID,
        data: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: polarity },
          { x: 4, y: 0 },
        ],
        xScaleType: ScaleType.Linear,
        yScaleType,
      });
      const axis = MockGlobalSpec.yAxis();
      const store = MockStore.default();
      MockStore.addSpecs([pointSeriesSpec, axis], store);
      // eslint-disable-next-line prefer-destructuring
      points = computeSeriesGeometriesSelector(store.getState()).geometries.lines[0]!.value.points;
    });

    describe.each([
      ['positive', 1],
      ['negative', -1],
    ])('%s', (_, pol) => {
      beforeAll(() => {
        polarity = pol;
      });

      describe.each([ScaleType.Linear, ScaleType.Log])('%s', (scaleType) => {
        beforeAll(() => {
          yScaleType = scaleType;
        });

        test('should render correct number of points', () => {
          expect(points.length).toBe(scaleType === ScaleType.Log ? 1 : 4);
        });
      });
    });
  });
});
