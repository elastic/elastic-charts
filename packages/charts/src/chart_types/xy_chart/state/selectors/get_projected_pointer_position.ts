/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleBand } from '../../../../scales/scale_band';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { Dimensions } from '../../../../utils/dimensions';
import { Point } from '../../../../utils/point';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSmallMultipleScalesSelector, SmallMultipleScales } from './compute_small_multiple_scales';

/** @internal */
export type PointerPosition = Point & { horizontalPanelValue: PrimitiveValue; verticalPanelValue: PrimitiveValue };

/**
 * Get the x and y pointer position relative to the chart projection area
 * @internal
 */
export const getProjectedPointerPositionSelector = createCustomCachedSelector(
  [getActivePointerPosition, computeChartDimensionsSelector, computeSmallMultipleScalesSelector],
  (currentPointerPosition, { chartDimensions }, smallMultipleScales): PointerPosition =>
    getProjectedPointerPosition(currentPointerPosition, chartDimensions, smallMultipleScales),
);

/**
 * Get the x and y pointer position relative to the chart projection area
 * @param chartAreaPointerPosition the pointer position relative to the chart area
 * @param horizontal SmallMultipleScales horizontal panel scale
 * @param vertical SmallMultipleScales vertical panel scale
 * @param chartAreaDimensions the chart dimensions
 */
function getProjectedPointerPosition(
  chartAreaPointerPosition: Point,
  { left, top, width, height }: Dimensions,
  { horizontal, vertical }: SmallMultipleScales,
): PointerPosition {
  const { x, y } = chartAreaPointerPosition;
  // get positions relative to chart
  let xPos = x - left;
  let yPos = y - top;

  // limit cursorPosition to the chart area
  if (xPos < 0 || xPos >= width) {
    xPos = -1;
  }
  if (yPos < 0 || yPos >= height) {
    yPos = -1;
  }
  const h = getPosRelativeToPanel(horizontal, xPos);
  const v = getPosRelativeToPanel(vertical, yPos);

  return {
    x: h.pos,
    y: v.pos,
    horizontalPanelValue: h.value,
    verticalPanelValue: v.value,
  };
}

function getPosRelativeToPanel(panelScale: ScaleBand, pos: number): { pos: number; value: PrimitiveValue } {
  const outerPadding = panelScale.outerPadding * panelScale.step;
  const innerPadding = panelScale.innerPadding * panelScale.step;
  const numOfDomainSteps = panelScale.domain.length;
  const rangeWithoutOuterPaddings = numOfDomainSteps * panelScale.bandwidth + (numOfDomainSteps - 1) * innerPadding;

  if (pos < outerPadding || pos > outerPadding + rangeWithoutOuterPaddings) {
    return { pos: -1, value: null };
  }
  const posWOInitialOuterPadding = pos - outerPadding;
  const minEqualSteps = (numOfDomainSteps - 1) * panelScale.step;
  if (posWOInitialOuterPadding <= minEqualSteps) {
    const relativePosIndex = Math.floor(posWOInitialOuterPadding / panelScale.step);
    const relativePos = posWOInitialOuterPadding - panelScale.step * relativePosIndex;
    if (relativePos > panelScale.bandwidth) {
      return { pos: -1, value: null };
    }
    return { pos: relativePos, value: panelScale.domain[relativePosIndex] ?? null };
  }
  return {
    pos: posWOInitialOuterPadding - panelScale.step * (numOfDomainSteps - 1),
    value: panelScale.domain[numOfDomainSteps - 1] ?? null,
  };
}
