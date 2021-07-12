/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MockAnnotationLineProps } from '../../../../mocks/annotations/annotations';
import { MockSeriesSpec, MockAnnotationSpec, MockGlobalSpec } from '../../../../mocks/specs';
import { MockStore } from '../../../../mocks/store';
import { ScaleType } from '../../../../scales/constants';
import { computeAnnotationDimensionsSelector } from '../../state/selectors/compute_annotations';
import { AnnotationDomainType } from '../../utils/specs';

function expectAnnotationAtPosition(
  data: Array<{ x: number; y: number }>,
  type: 'line' | 'bar',
  indexPosition: number,
  expectedLinePosition: number,
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
  const annotation = MockAnnotationSpec.line({
    dataValues: [
      {
        dataValue: indexPosition,
      },
    ],
  });

  MockStore.addSpecs([settings, ...specs, annotation], store);
  const annotations = computeAnnotationDimensionsSelector(store.getState());
  expect(annotations.get(annotation.id)).toEqual([
    MockAnnotationLineProps.default({
      specId: 'line_annotation_1',
      datum: {
        dataValue: indexPosition,
      },
      linePathPoints: {
        x1: expectedLinePosition,
        y1: 0,
        x2: expectedLinePosition,
        y2: 100,
      },
    }),
  ]);
}

describe('Render vertical line annotation within', () => {
  it.each([
    [0, 1, 12.5], // middle of 1st bar
    [1, 1, 37.5], // middle of 2nd bar
    [2, 1, 62.5], // middle of 3rd bar
    [3, 1, 87.5], // middle of 4th bar
    [1, 2, 37.5], // middle of 2nd bar
    [1, 3, 37.5], // middle of 2nd bar
  ])('a bar at position %i, %i specs, all scales', (dataValue, numOfSpecs, linePosition) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ];
    expectAnnotationAtPosition(data, 'bar', dataValue, linePosition, numOfSpecs);
    expectAnnotationAtPosition(data, 'bar', dataValue, linePosition, numOfSpecs, ScaleType.Ordinal);
    expectAnnotationAtPosition(data, 'bar', dataValue, linePosition, numOfSpecs, ScaleType.Time);
  });

  it.each([
    [0, 1, 0], // the start of the chart
    [1, 1, 50], // the middle of the chart
    [2, 1, 100], // the end of the chart
    [1, 2, 50], // the middle of the chart
    [1, 3, 50], // the middle of the chart
  ])('line point at position %i, %i specs, linear scale', (dataValue, numOfSpecs, linePosition) => {
    const data = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expectAnnotationAtPosition(data, 'line', dataValue, linePosition, numOfSpecs);
  });

  it.each([
    [0, 1, 12.5], // 1st ordinal line point
    [1, 1, 37.5], // 2nd ordinal line point
    [2, 1, 62.5], // 3rd ordinal line point
    [3, 1, 87.5], // 4th ordinal line point
    [1, 2, 37.5], // 2nd ordinal line point
    [1, 3, 37.5], // 2nd ordinal line point
  ])('line point at position %i, %i specs, Ordinal scale', (dataValue, numOfSpecs, linePosition) => {
    const data = [
      { x: 0, y: 4 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ];
    expectAnnotationAtPosition(data, 'line', dataValue, linePosition, numOfSpecs, ScaleType.Ordinal);
  });

  it('histogramMode with line after the max value but before the max + minInterval', () => {
    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins({
      xDomain: {
        min: 0,
        max: 9,
        minInterval: 1,
      },
    });
    const spec = MockSeriesSpec.histogramBar({
      xScaleType: ScaleType.Linear,
      data: [
        {
          x: 0,
          y: 1,
        },
        {
          x: 9,
          y: 20,
        },
      ],
    });
    const annotation = MockAnnotationSpec.line({
      domainType: AnnotationDomainType.XDomain,
      dataValues: [{ dataValue: 9.5, details: 'foo' }],
    });

    MockStore.addSpecs([settings, spec, annotation], store);
    const annotations = computeAnnotationDimensionsSelector(store.getState());
    expect(annotations.get(annotation.id)).toEqual([
      MockAnnotationLineProps.default({
        specId: 'line_annotation_1',
        linePathPoints: {
          x1: 95,
          y1: 0,
          x2: 95,
          y2: 100,
        },
        datum: { dataValue: 9.5, details: 'foo' },
      }),
    ]);
  });
});
