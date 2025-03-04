/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AnnotationRectProps } from './types';
import type { Rect } from '../../../../geoms/types';
import { MockSeriesSpec, MockAnnotationSpec, MockGlobalSpec } from '../../../../mocks/specs';
import { MockStore } from '../../../../mocks/store';
import { ScaleType } from '../../../../scales/constants';
import { computeAnnotationDimensionsSelector } from '../../state/selectors/compute_annotations';
import type { RectAnnotationDatum } from '../../utils/specs';

function expectAnnotationAtPosition(
  data: Array<{ x: number; y: number }>,
  type: 'line' | 'bar' | 'histogram',
  dataValues: RectAnnotationDatum[],
  expectedRect: Rect,
  numOfSpecs = 1,
  xScaleType: typeof ScaleType.Ordinal | typeof ScaleType.Linear | typeof ScaleType.Time = ScaleType.Linear,
) {
  const store = MockStore.default();
  const settings = MockGlobalSpec.settingsNoMargins();
  const specs = new Array(numOfSpecs).fill(0).map((d, i) =>
    MockSeriesSpec.byTypePartial(type)({
      id: `spec_${i}`,
      xScaleType,
      data,
    }),
  );
  const annotation = MockAnnotationSpec.rect({
    dataValues,
  });

  MockStore.addSpecs([settings, ...specs, annotation], store);
  const annotations = computeAnnotationDimensionsSelector(store.getState());
  const renderedAnnotations = annotations.get(annotation.id)!;
  expect(renderedAnnotations.length).toBe(1);
  const { rect } = renderedAnnotations[0] as AnnotationRectProps;
  expect(rect.x).toBeCloseTo(expectedRect.x, 3);
  expect(rect.y).toBeCloseTo(expectedRect.y, 3);
  expect(rect.width).toBeCloseTo(expectedRect.width, 3);
  expect(rect.height).toBeCloseTo(expectedRect.height, 3);
}

describe('Render rect annotation within', () => {
  it.each`
    x0   | numOfSpecs | x     | width
    ${0} | ${1}       | ${0}  | ${100}
    ${1} | ${1}       | ${25} | ${75}
    ${2} | ${1}       | ${50} | ${50}
    ${3} | ${1}       | ${75} | ${25}
    ${1} | ${2}       | ${25} | ${75}
    ${2} | ${3}       | ${50} | ${50}
  `('bars starting from $x0, $numOfSpecs specs, all scales', ({ x0, numOfSpecs, x, width }) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ];
    const dataValues: RectAnnotationDatum[] = [
      {
        coordinates: { x0 },
      },
    ];
    const rect = { x, width, y: 0, height: 100 };
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs);
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs, ScaleType.Ordinal);
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs, ScaleType.Time);
  });

  it.each`
    x1   | numOfSpecs | x    | width
    ${0} | ${1}       | ${0} | ${25}
    ${1} | ${1}       | ${0} | ${50}
    ${2} | ${1}       | ${0} | ${75}
    ${3} | ${1}       | ${0} | ${100}
    ${1} | ${2}       | ${0} | ${50}
    ${2} | ${2}       | ${0} | ${75}
  `('bars starting ending at $x1, $numOfSpecs specs, all scales', ({ x1, numOfSpecs, x, width }) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ];
    const dataValues: RectAnnotationDatum[] = [
      {
        coordinates: { x1 },
      },
    ];
    const rect = { x, width, y: 0, height: 100 };
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs);
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs, ScaleType.Ordinal);
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs, ScaleType.Time);
  });

  it.each`
    x0   | x1   | numOfSpecs | x     | width
    ${0} | ${0} | ${1}       | ${0}  | ${25}
    ${0} | ${1} | ${1}       | ${0}  | ${50}
    ${1} | ${3} | ${1}       | ${25} | ${75}
    ${0} | ${1} | ${2}       | ${0}  | ${50}
    ${1} | ${3} | ${3}       | ${25} | ${75}
  `('bars starting at $x0, ending at $x1, $numOfSpecs specs, all scales', ({ x0, x1, numOfSpecs, x, width }) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ];
    const dataValues: RectAnnotationDatum[] = [
      {
        coordinates: { x0, x1 },
      },
    ];
    const rect = { x, width, y: 0, height: 100 };
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs);
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs, ScaleType.Ordinal);
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, numOfSpecs, ScaleType.Time);
  });

  it.each`
    x0   | x1   | numOfSpecs | x     | width
    ${0} | ${0} | ${1}       | ${0}  | ${25}
    ${0} | ${1} | ${1}       | ${0}  | ${50}
    ${1} | ${3} | ${1}       | ${25} | ${75}
    ${0} | ${1} | ${2}       | ${0}  | ${50}
    ${1} | ${3} | ${3}       | ${25} | ${75}
  `('lines starting at $x0, ending at $x1, $numOfSpecs specs, ordinal scale', ({ x0, x1, numOfSpecs, x, width }) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ];
    const dataValues: RectAnnotationDatum[] = [
      {
        coordinates: { x0, x1 },
      },
    ];
    const rect = { x, width, y: 0, height: 100 };
    expectAnnotationAtPosition(data, 'line', dataValues, rect, numOfSpecs, ScaleType.Ordinal);
  });

  it.each`
    x0   | x1   | numOfSpecs | x     | width
    ${0} | ${0} | ${1}       | ${0}  | ${0}
    ${0} | ${1} | ${1}       | ${0}  | ${50}
    ${1} | ${2} | ${1}       | ${50} | ${50}
    ${0} | ${2} | ${1}       | ${0}  | ${100}
    ${0} | ${1} | ${2}       | ${0}  | ${50}
    ${1} | ${2} | ${3}       | ${50} | ${50}
  `(
    'on line starting at $x0, ending at $x1, $numOfSpecs specs, continuous scale',
    ({ x0, x1, numOfSpecs, x, width }) => {
      const data = [
        { x: 0, y: 4 },
        { x: 1, y: 1 },
        { x: 2, y: 3 },
      ];
      const dataValues: RectAnnotationDatum[] = [
        {
          coordinates: { x0, x1 },
        },
      ];
      const rect = { x, width, y: 0, height: 100 };
      expectAnnotationAtPosition(data, 'line', dataValues, rect, numOfSpecs, ScaleType.Linear);
    },
  );
  it.each`
    x0   | x1   | numOfSpecs | x     | width
    ${0} | ${0} | ${1}       | ${0}  | ${0}
    ${0} | ${1} | ${1}       | ${0}  | ${25}
    ${1} | ${2} | ${1}       | ${25} | ${25}
    ${0} | ${2} | ${1}       | ${0}  | ${50}
    ${0} | ${1} | ${2}       | ${0}  | ${25}
    ${1} | ${2} | ${3}       | ${25} | ${25}
  `(
    'on histogram starting at $x0, ending at $x1, $numOfSpecs specs, continuous scale',
    ({ x0, x1, numOfSpecs, x, width }) => {
      const data = [
        { x: 0, y: 4 },
        { x: 1, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
      ];
      const dataValues: RectAnnotationDatum[] = [
        {
          coordinates: { x0, x1 },
        },
      ];
      const rect = { x, width, y: 0, height: 100 };
      expectAnnotationAtPosition(data, 'histogram', dataValues, rect, numOfSpecs, ScaleType.Linear);
    },
  );

  it.each`
    prop    | x     | y     | width  | height
    ${'x0'} | ${50} | ${0}  | ${50}  | ${100}
    ${'x1'} | ${0}  | ${0}  | ${50}  | ${100}
    ${'y0'} | ${0}  | ${0}  | ${100} | ${75}
    ${'y1'} | ${0}  | ${75} | ${100} | ${25}
  `('expand annotation with only one prop configured:  $prop', ({ prop, x, y, width, height }) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const dataValues: RectAnnotationDatum[] = [
      {
        coordinates: { [prop]: 1 },
      },
    ];
    const rect = { x, width, y, height };
    expectAnnotationAtPosition(data, 'line', dataValues, rect, 1, ScaleType.Linear);
  });

  it.each`
    value | prop
    ${10} | ${'y1'}
    ${-4} | ${'y0'}
    ${-4} | ${'x0'}
    ${5}  | ${'x1'}
  `('out of bound annotations for $prop', ({ prop, value }) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
    ];
    const dataValues: RectAnnotationDatum[] = [
      {
        coordinates: { [prop]: value },
      },
    ];
    const rect = { x: 0, width: 100, y: 0, height: 100 };
    expectAnnotationAtPosition(data, 'line', dataValues, rect, 1, ScaleType.Linear);
    expectAnnotationAtPosition(data, 'bar', dataValues, rect, 1, ScaleType.Linear);
  });

  it('annotation with no height will take the chart dimension height', () => {
    const height = 200;
    const store = MockStore.default({ top: 0, left: 0, width: 20, height });
    const settings = MockGlobalSpec.settingsNoMargins();
    const annotation = MockAnnotationSpec.rect({
      dataValues: [{ coordinates: { x0: 2, x1: 4 } }],
    });
    const barWithYNoHeight = MockSeriesSpec.bar({
      data: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 4, y: 0 },
      ],
    });
    MockStore.addSpecs([settings, annotation, barWithYNoHeight], store);
    const expected = computeAnnotationDimensionsSelector(store.getState());
    const [resultAnnotation] = expected.get('rect_annotation_1') ?? [];
    expect(resultAnnotation).toMatchObject({
      rect: { height },
    });
  });
  it('annotation with fit domain will render', () => {
    const heightFromStore = 200;
    const store = MockStore.default({ top: 0, left: 0, width: 20, height: heightFromStore });
    const settings = MockGlobalSpec.settingsNoMargins();
    const yDomainFitted = MockGlobalSpec.yAxis({ domain: { fit: true } });
    const annotation = MockAnnotationSpec.rect({
      dataValues: [{ coordinates: { x0: 2, x1: 4 } }],
    });
    const bar = MockSeriesSpec.bar({
      data: [
        { x: 1, y: 0 },
        { x: 2, y: 5 },
        { x: 4, y: 10 },
      ],
    });
    MockStore.addSpecs([settings, yDomainFitted, annotation, bar], store);
    const expected = computeAnnotationDimensionsSelector(store.getState());
    const [resultAnnotation] = expected.get('rect_annotation_1') ?? [];
    expect(resultAnnotation).toMatchObject({
      rect: { height: 200 },
    });
  });
  it('annotation with group id should render with x0 and x1 values', () => {
    const height = 200;
    const store = MockStore.default({ top: 0, left: 0, width: 20, height });
    const settings = MockGlobalSpec.settingsNoMargins();
    const annotation = MockAnnotationSpec.rect({
      groupId: 'group1',
      dataValues: [{ coordinates: { x0: 2, x1: 4 } }],
    });
    const bar = MockSeriesSpec.bar({
      data: [
        { x: 1, y: 0 },
        { x: 2, y: 5 },
        { x: 4, y: 10 },
      ],
    });
    MockStore.addSpecs([settings, annotation, bar], store);
    const expected = computeAnnotationDimensionsSelector(store.getState());
    const [resultAnnotation] = expected.get('rect_annotation_1') ?? [];
    expect(resultAnnotation).toMatchObject({
      rect: { height },
    });
  });
  it('annotation with no group id should render', () => {
    const height = 200;
    const store = MockStore.default({ top: 0, left: 0, width: 20, height });
    const settings = MockGlobalSpec.settingsNoMargins();
    const annotation = MockAnnotationSpec.rect({
      groupId: undefined,
      dataValues: [{ coordinates: { x0: 2, x1: 4 } }],
    });
    const bar = MockSeriesSpec.bar({
      data: [
        { x: 1, y: 0 },
        { x: 2, y: 5 },
        { x: 4, y: 10 },
      ],
    });
    MockStore.addSpecs([settings, annotation, bar], store);
    const expected = computeAnnotationDimensionsSelector(store.getState());
    const [resultAnnotation] = expected.get('rect_annotation_1') ?? [];
    expect(resultAnnotation).toMatchObject({
      rect: { height },
    });
  });
});
