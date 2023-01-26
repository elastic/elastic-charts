/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getAnnotationAxis, getTransformedCursor, invertTransformedCursor } from './utils';
import { MockGlobalSpec } from '../../../mocks/specs';
import { Position, Rotation } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { AnnotationDomainType } from '../utils/specs';

describe('Annotation utils', () => {
  const groupId = 'foo-group';

  const verticalAxisSpec = MockGlobalSpec.yAxis({
    id: 'vertical_axis',
    groupId,
  });
  const horizontalAxisSpec = MockGlobalSpec.xAxis({
    id: 'vertical_axis',
    groupId,
  });

  test('should get associated axis for an annotation', () => {
    const noAxis = getAnnotationAxis([], groupId, AnnotationDomainType.XDomain, 0);
    expect(noAxis).toBeUndefined();

    const localAxesSpecs = [horizontalAxisSpec, verticalAxisSpec];

    const xAnnotationAxisPosition = getAnnotationAxis(localAxesSpecs, groupId, AnnotationDomainType.XDomain, 0);
    expect(xAnnotationAxisPosition).toEqual(Position.Bottom);

    const yAnnotationAxisPosition = getAnnotationAxis(localAxesSpecs, groupId, AnnotationDomainType.YDomain, 0);
    expect(yAnnotationAxisPosition).toEqual(Position.Left);
  });

  test('should get rotated cursor position', () => {
    const cursorPosition = { x: 1, y: 2 };
    const chartDimensions: Dimensions = {
      width: 10,
      height: 20,
      top: 5,
      left: 15,
    };
    expect(getTransformedCursor(cursorPosition, chartDimensions, 0)).toEqual(cursorPosition);
    expect(getTransformedCursor(cursorPosition, chartDimensions, 90)).toEqual({ x: 2, y: 9 });
    expect(getTransformedCursor(cursorPosition, chartDimensions, -90)).toEqual({ x: 18, y: 1 });
    expect(getTransformedCursor(cursorPosition, chartDimensions, 180)).toEqual({ x: 9, y: 18 });
  });

  describe('#invertTranformedCursor', () => {
    const cursorPosition = { x: 1, y: 2 };
    const chartDimensions: Dimensions = {
      width: 10,
      height: 20,
      top: 5,
      left: 15,
    };
    it.each<Rotation>([0, 90, -90, 180])('Should invert rotated cursor - rotation %d', (rotation) => {
      expect(
        invertTransformedCursor(
          getTransformedCursor(cursorPosition, chartDimensions, rotation),
          chartDimensions,
          rotation,
        ),
      ).toEqual(cursorPosition);
    });

    it.each<Rotation>([0, 90, -90, 180])('Should invert rotated projected cursor - rotation %d', (rotation) => {
      expect(
        invertTransformedCursor(
          getTransformedCursor(cursorPosition, chartDimensions, rotation, true),
          chartDimensions,
          rotation,
          true,
        ),
      ).toEqual(cursorPosition);
    });
  });
});
