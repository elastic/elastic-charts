/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isWithinRectBounds } from './dimensions';
import type { AnnotationRectProps } from './types';
import { MockAnnotationSpec, MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { computeAnnotationDimensionsSelector } from '../../state/selectors/compute_annotations';

describe('Rect Annotation Dimensions', () => {
  const continuousBarChart = MockSeriesSpec.area({
    xScaleType: ScaleType.Linear,
    data: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 10 },
      { x: 4, y: 5 },
      { x: 10, y: 10 },
    ],
  });

  test('should skip computing rectangle annotation dimensions when annotation data invalid', () => {
    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins();

    const annotationRectangle = MockAnnotationSpec.rect({
      id: 'rect',
      dataValues: [
        { coordinates: { x0: 1, x1: 2, y0: -10, y1: 5 } },
        { coordinates: { x0: null, x1: null, y0: null, y1: null } },
      ],
    });

    MockStore.addSpecs([settings, continuousBarChart, annotationRectangle], store);
    const skippedInvalid = computeAnnotationDimensionsSelector(store.getState());
    expect(skippedInvalid.size).toBe(1);
  });

  test('should compute rectangle dimensions shifted for histogram mode', () => {
    const store = MockStore.default();
    const settings = MockGlobalSpec.settingsNoMargins();

    const annotationRectangle = MockAnnotationSpec.rect({
      id: 'rect',
      dataValues: [
        { coordinates: { x0: 1, x1: null, y0: null, y1: null } },
        { coordinates: { x0: null, x1: 1, y0: null, y1: null } },
        { coordinates: { x0: null, x1: null, y0: 1, y1: null } },
        { coordinates: { x0: null, x1: null, y0: null, y1: 1 } },
      ],
    });

    MockStore.addSpecs([settings, continuousBarChart, annotationRectangle], store);
    const [dims1, dims2, dims3, dims4] = computeAnnotationDimensionsSelector(store.getState()).get(
      'rect',
    ) as AnnotationRectProps[];

    expect(dims1?.rect.x).toBe(10);
    expect(dims1?.rect.width).toBeCloseTo(90);
    expect(dims1?.rect.y).toBe(0);
    expect(dims1?.rect.height).toBe(100);

    expect(dims2?.rect.x).toBe(0);
    expect(dims2?.rect.width).toBe(10);
    expect(dims2?.rect.y).toBe(0);
    expect(dims2?.rect.height).toBe(100);

    expect(dims3?.rect.x).toBe(0);
    expect(dims3?.rect.width).toBe(100);
    expect(dims3?.rect.y).toBe(0);
    expect(dims3?.rect.height).toBe(90);

    expect(dims4?.rect.x).toBe(0);
    expect(dims4?.rect.width).toBeCloseTo(100);
    expect(dims4?.rect.y).toBe(90);
    expect(dims4?.rect.height).toBe(10);
  });

  test('should determine if a point is within a rectangle annotation', () => {
    expect(isWithinRectBounds({ x: 3, y: 4 }, { startX: 2, endX: 4, startY: 3, endY: 5 })).toBe(true);
    // TODO check I've a doubt that this should be an error
    expect(isWithinRectBounds({ x: 3, y: 4 }, { startX: 2, endX: 4, startY: 5, endY: 3 })).toBe(false);
    expect(isWithinRectBounds({ x: 3, y: 4 }, { startX: 2, endX: 4, startY: 5, endY: 6 })).toBe(false);

    expect(isWithinRectBounds({ x: 3, y: 4 }, { startX: 4, endX: 5, startY: 3, endY: 5 })).toBe(false);
    expect(isWithinRectBounds({ x: 3, y: 4 }, { startX: 4, endX: 2, startY: 3, endY: 5 })).toBe(false);
  });
});
