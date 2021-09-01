/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../../../geoms/types';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { Point } from '../../../../utils/point';
import { isHorizontalRotation } from '../../state/utils/common';
import { AnnotationType } from '../../utils/specs';
import { AnnotationTooltipState, Bounds } from '../types';
import { isWithinRectBounds } from './dimensions';
import { AnnotationRectProps } from './types';

/** @internal */
export function getRectAnnotationTooltipState(
  cursorPosition: Point,
  annotationRects: AnnotationRectProps[],
  rotation: Rotation,
  chartDimensions: Dimensions,
  id: string,
): AnnotationTooltipState | null {
  const totalAnnotationRect = annotationRects.length;

  for (let i = 0; i < totalAnnotationRect; i++) {
    const rectProps = annotationRects[i];
    const { panel, datum } = rectProps;

    const rect = transformRotateRect(rectProps.rect, rotation, panel);

    const startX = rect.x + chartDimensions.left + panel.left;
    const endX = startX + rect.width;
    const startY = rect.y + chartDimensions.top + panel.top;
    const endY = startY + rect.height;
    const bounds: Bounds = { startX, endX, startY, endY };
    const isWithinBounds = isWithinRectBounds(cursorPosition, bounds);
    if (isWithinBounds) {
      return {
        id,
        isVisible: true,
        annotationType: AnnotationType.Rectangle,
        anchor: {
          x: cursorPosition.x,
          y: cursorPosition.y,
          width: 0,
          height: 0,
        },
        datum,
      };
    }
  }

  return null;
}

function transformRotateRect(rect: Rect, rotation: Rotation, dim: Dimensions): Rect {
  const isHorizontalRotated = isHorizontalRotation(rotation);
  const width = isHorizontalRotated ? dim.width : dim.height;
  const height = isHorizontalRotated ? dim.height : dim.width;

  switch (rotation) {
    case 90:
      return {
        x: height - rect.height - rect.y,
        y: rect.x,
        width: rect.height,
        height: rect.width,
      };
    case -90:
      return {
        x: rect.y,
        y: width - rect.x - rect.width,
        width: rect.height,
        height: rect.width,
      };
    case 180:
      return {
        x: width - rect.x - rect.width,
        y: height - rect.y - rect.height,
        width: rect.width,
        height: rect.height,
      };
    case 0:
    default:
      return rect;
  }
}
