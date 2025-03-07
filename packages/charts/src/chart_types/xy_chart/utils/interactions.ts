/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Rotation } from '../../../utils/common';
import type { Size } from '../../../utils/dimensions';

/**
 * Get the cursor position depending on the chart rotation
 * @param xPos x position relative to chart
 * @param yPos y position relative to chart
 * @param chartRotation the chart rotation
 * @param chartDimension the chart dimension
 * @internal
 */
export function getOrientedXPosition(xPos: number, yPos: number, chartRotation: Rotation, chartDimension: Size) {
  switch (chartRotation) {
    case 180:
      return chartDimension.width - xPos;
    case 90:
      return yPos;
    case -90:
      return chartDimension.height - yPos;
    case 0:
    default:
      return xPos;
  }
}

/** @internal */
export function getOrientedYPosition(xPos: number, yPos: number, chartRotation: Rotation, chartDimension: Size) {
  switch (chartRotation) {
    case 180:
      return chartDimension.height - yPos;
    case -90:
      return xPos;
    case 90:
      return chartDimension.width - xPos;
    case 0:
    default:
      return yPos;
  }
}
