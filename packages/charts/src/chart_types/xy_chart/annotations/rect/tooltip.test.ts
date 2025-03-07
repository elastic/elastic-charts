/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getRectAnnotationTooltipState } from './tooltip';
import type { AnnotationRectProps } from './types';
import { MockAnnotationRectProps } from '../../../../mocks/annotations/annotations';
import type { Dimensions } from '../../../../utils/dimensions';
import { AnnotationType } from '../../utils/specs';
import type { AnnotationTooltipState } from '../types';

describe('Rect annotation tooltip', () => {
  test('should compute tooltip state for rect annotation', () => {
    const chartDimensions: Dimensions = {
      width: 10,
      height: 20,
      top: 5,
      left: 15,
    };
    const cursorPosition = { x: 18, y: 9 };
    const annotationRects: AnnotationRectProps[] = [
      MockAnnotationRectProps.default({
        rect: { x: 2, y: 3, width: 3, height: 5 },
        panel: { top: 0, left: 0, width: 10, height: 20 },
        datum: { coordinates: { x0: 0, x1: 10, y0: 0, y1: 10 } },
      }),
    ];
    const specId = 'rect1';

    const expectedVisibleTooltipState: AnnotationTooltipState = {
      id: 'testing',
      specId,
      isVisible: true,
      annotationType: AnnotationType.Rectangle,
      anchor: {
        x: cursorPosition.x,
        y: cursorPosition.y,
        width: 0,
        height: 0,
      },
      datum: { coordinates: { x0: 0, x1: 10, y0: 0, y1: 10 } },
    };
    const visibleTooltip = getRectAnnotationTooltipState(cursorPosition, annotationRects, 0, chartDimensions, specId);

    expect(visibleTooltip).toEqual(expectedVisibleTooltipState);
  });
});
