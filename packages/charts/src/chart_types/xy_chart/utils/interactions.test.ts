/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getOrientedXPosition, getOrientedYPosition } from './interactions';
import { isCrosshairTooltipType, isFollowTooltipType } from '../../../specs';
import { TooltipType } from '../../../specs/constants';
import type { Dimensions } from '../../../utils/dimensions';

describe('Interaction utils', () => {
  const chartDimensions: Dimensions = {
    width: 200,
    height: 100,
    left: 10,
    top: 10,
  };

  test('limit x position with x already relative to chart', () => {
    const xPos = 30;
    const yPos = 50;
    let validPosition = getOrientedXPosition(xPos, yPos, 0, chartDimensions);
    expect(validPosition).toBe(xPos);
    validPosition = getOrientedXPosition(xPos, yPos, 180, chartDimensions);
    expect(validPosition).toBe(chartDimensions.width - xPos);
    validPosition = getOrientedXPosition(xPos, yPos, 90, chartDimensions);
    expect(validPosition).toBe(yPos);
    validPosition = getOrientedXPosition(xPos, yPos, -90, chartDimensions);
    expect(validPosition).toBe(chartDimensions.height - yPos);
  });
  test('limit y position with x already relative to chart', () => {
    const yPos = 30;
    const xPos = 50;
    let validPosition = getOrientedYPosition(xPos, yPos, 0, chartDimensions);
    expect(validPosition).toBe(yPos);
    validPosition = getOrientedYPosition(xPos, yPos, 180, chartDimensions);
    expect(validPosition).toBe(chartDimensions.height - yPos);
    validPosition = getOrientedYPosition(xPos, yPos, 90, chartDimensions);
    expect(validPosition).toBe(chartDimensions.width - xPos);
    validPosition = getOrientedYPosition(xPos, yPos, -90, chartDimensions);
    expect(validPosition).toBe(xPos);
  });
  test('checks tooltip type helpers', () => {
    expect(isCrosshairTooltipType(TooltipType.Crosshairs)).toBe(true);
    expect(isCrosshairTooltipType(TooltipType.VerticalCursor)).toBe(true);
    expect(isCrosshairTooltipType(TooltipType.Follow)).toBe(false);
    expect(isCrosshairTooltipType(TooltipType.None)).toBe(false);

    expect(isFollowTooltipType(TooltipType.Crosshairs)).toBe(false);
    expect(isFollowTooltipType(TooltipType.VerticalCursor)).toBe(false);
    expect(isFollowTooltipType(TooltipType.Follow)).toBe(true);
    expect(isFollowTooltipType(TooltipType.None)).toBe(false);
  });
});
