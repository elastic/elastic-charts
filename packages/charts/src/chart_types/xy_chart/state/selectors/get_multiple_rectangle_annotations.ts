/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeAnnotationDimensionsSelector } from './compute_annotations';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getTooltipStateForDOMElements } from './get_annotation_tooltip_state';
import { getAnnotationSpecsSelector } from './get_specs';
import { getTooltipInfoSelector } from './get_tooltip_values_highlighted_geoms';
import type { TooltipInfo } from '../../../../components/tooltip/types';
import type { DOMElement } from '../../../../state/actions/dom_element';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import type { Rotation } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import type { AnnotationId } from '../../../../utils/ids';
import type { Point } from '../../../../utils/point';
import { computeMultipleRectAnnotationTooltipState } from '../../annotations/tooltip';
import type { AnnotationTooltipState, AnnotationDimensions } from '../../annotations/types';
import type { AnnotationSpec } from '../../utils/specs';
import { AnnotationType } from '../../utils/specs';

const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;
const getHoveredDOMElement = (state: GlobalChartState) => state.interactions.hoveredDOMElement;

/** @internal */
export const getMultipleRectangleAnnotations = createCustomCachedSelector(
  [
    getCurrentPointerPosition,
    computeChartDimensionsSelector,
    getChartRotationSelector,
    getAnnotationSpecsSelector,
    computeAnnotationDimensionsSelector,
    getTooltipInfoSelector,
    getHoveredDOMElement,
  ],
  getMultipleRectangularAnnotationTooltipState,
);

function getMultipleRectangularAnnotationTooltipState(
  cursorPosition: Point,
  {
    chartDimensions,
  }: {
    chartDimensions: Dimensions;
  },
  chartRotation: Rotation,
  annotationSpecs: AnnotationSpec[],
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>,
  tooltip: TooltipInfo,
  hoveredDOMElement: DOMElement | null,
): AnnotationTooltipState[] | null {
  // capture line marker
  const hoveredTooltip = getTooltipStateForDOMElements(
    chartDimensions,
    annotationSpecs,
    annotationDimensions,
    hoveredDOMElement,
  );

  if (hoveredTooltip) {
    return [hoveredTooltip];
  }
  const tooltipState = computeMultipleRectAnnotationTooltipState(
    cursorPosition,
    annotationDimensions,
    annotationSpecs,
    chartRotation,
    chartDimensions,
  );

  // If there's a highlighted chart element tooltip value, don't show annotation tooltip
  const isChartTooltipDisplayed = tooltip.values.some(({ isHighlighted }) => isHighlighted);
  tooltipState?.forEach((rectAnnotation) => {
    if (
      tooltipState &&
      rectAnnotation.isVisible &&
      rectAnnotation.annotationType === AnnotationType.Rectangle &&
      isChartTooltipDisplayed
    ) {
      return null;
    }
  });
  return tooltipState;
}
