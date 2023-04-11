/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { ScaleType } from '../../../scales/constants';
import { computeSeriesGeometriesSelector } from '../state/selectors/compute_series_geometries';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

describe('Rendering points - bubble', () => {
  describe('Single series bubble chart - ordinal', () => {
    const spec = MockSeriesSpec.bubble({
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
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([spec, settings], store);
    const {
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());
    test('Can render a bubble', () => {
      const { value: bubbleGeometry } = bubbles[0]!;
      expect(bubbleGeometry.points).toHaveLength(2);
      expect(bubbleGeometry.color).toBe('red');
      expect(bubbleGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(bubbleGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
    });
    test('Can render two points', () => {
      const {
        value: { points },
      } = bubbles[0]!;

      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Multi series bubble chart - ordinal', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1 = MockSeriesSpec.bubble({
      id: spec1Id,
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
    const pointSeriesSpec2 = MockSeriesSpec.bubble({
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
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render two ordinal bubbles', () => {
      const { value: firstBubble } = bubbles[0]!;
      const { value: secondBubble } = bubbles[1]!;
      expect(firstBubble.points).toHaveLength(2);
      expect(firstBubble.color).toBe('red');
      expect(firstBubble.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstBubble.seriesIdentifier.specId).toEqual(spec1Id);

      expect(secondBubble.points).toHaveLength(2);
      expect(secondBubble.color).toBe('blue');
      expect(secondBubble.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondBubble.seriesIdentifier.specId).toEqual(spec2Id);
      expect(geometriesIndex.size).toEqual(4);
    });
    test('can render first spec points', () => {
      const {
        value: { points },
      } = bubbles[0]!;
      expect(points).toMatchSnapshot();
    });
    test('can render second spec points', () => {
      const {
        value: { points },
      } = bubbles[1]!;
      expect(points).toMatchSnapshot();
    });
  });
  describe('Single series bubble chart - linear', () => {
    const pointSeriesSpec = MockSeriesSpec.bubble({
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
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render a linear bubble', () => {
      const { value: bubbleGeometry } = bubbles[0]!;
      expect(bubbleGeometry.points).toHaveLength(2);
      expect(bubbleGeometry.color).toBe('red');
      expect(bubbleGeometry.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(bubbleGeometry.seriesIdentifier.specId).toEqual(SPEC_ID);
    });
    test('Can render two points', () => {
      const {
        value: { points },
      } = bubbles[0]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Multi series bubble chart - linear', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1 = MockSeriesSpec.bubble({
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
    const pointSeriesSpec2 = MockSeriesSpec.bubble({
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
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('can render two linear bubbles', () => {
      const { value: firstBubble } = bubbles[0]!;
      const { value: secondBubble } = bubbles[1]!;
      expect(firstBubble.points).toHaveLength(2);
      expect(firstBubble.color).toBe('red');
      expect(firstBubble.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(firstBubble.seriesIdentifier.specId).toEqual(spec1Id);

      expect(secondBubble.points).toHaveLength(2);
      expect(secondBubble.color).toBe('blue');
      expect(secondBubble.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(secondBubble.seriesIdentifier.specId).toEqual(spec2Id);
      expect(geometriesIndex.size).toEqual(4);
    });
    test('can render first spec points', () => {
      const {
        value: { points },
      } = bubbles[0]!;
      expect(points).toMatchSnapshot();
    });
    test('can render second spec points', () => {
      const {
        value: { points },
      } = bubbles[1]!;
      expect(points).toMatchSnapshot();
    });
  });
  describe('Single series bubble chart - time', () => {
    const pointSeriesSpec = MockSeriesSpec.bubble({
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
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render a time bubble', () => {
      const { value: renderedBubble } = bubbles[0]!;
      expect(renderedBubble.points).toHaveLength(2);
      expect(renderedBubble.color).toBe('red');
      expect(renderedBubble.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedBubble.seriesIdentifier.specId).toEqual(SPEC_ID);
    });
    test('Can render two points', () => {
      const {
        value: { points },
      } = bubbles[0]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(points.length);
    });
  });
  describe('Multi series bubble chart - time', () => {
    const spec1Id = 'point1';
    const spec2Id = 'point2';
    const pointSeriesSpec1 = MockSeriesSpec.bubble({
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
    const pointSeriesSpec2 = MockSeriesSpec.bubble({
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
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());
    test('can render first spec points', () => {
      const {
        value: { points },
      } = bubbles[0]!;
      expect(points).toMatchSnapshot();
      expect(geometriesIndex.size).toEqual(4);
    });
    test('can render second spec points', () => {
      const {
        value: { points },
      } = bubbles[1]!;
      expect(points).toMatchSnapshot();
    });
  });
  describe('Single series bubble chart - y log', () => {
    const pointSeriesSpec = MockSeriesSpec.bubble({
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
    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } });
    MockStore.addSpecs([pointSeriesSpec, settings], store);
    const {
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());

    test('Can render a split bubble', () => {
      const { value: renderedBubble } = bubbles[0]!;
      expect(renderedBubble.points).toHaveLength(7);
      expect(renderedBubble.color).toBe('red');
      expect(renderedBubble.seriesIdentifier.seriesKeys).toEqual([1]);
      expect(renderedBubble.seriesIdentifier.specId).toEqual(SPEC_ID);
    });
    test('Can render points', () => {
      const {
        value: { points },
      } = bubbles[0]!;
      // all the points minus the undefined ones on a log scale
      expect(points.length).toBe(7);
      // we expect the same size of geometries as we exclude non-finite ones
      expect(geometriesIndex.size).toEqual(7);
    });
  });
  describe('Remove points datum is not in domain', () => {
    const pointSeriesSpec = MockSeriesSpec.bubble({
      id: SPEC_ID,
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
      geometries: { bubbles },
      geometriesIndex,
    } = computeSeriesGeometriesSelector(store.getState());
    test('Should render 2 points', () => {
      const {
        value: { points },
      } = bubbles[0]!;
      // will not render the 4th point that is out of x domain, the 3rd point is not rendered due to the y Domain max of 1
      expect(points).toHaveLength(2);
      // will keep the 3rd point as an indexedGeometry
      expect(geometriesIndex.size).toEqual(3);
      expect(points).toMatchSnapshot();
    });
  });
});
