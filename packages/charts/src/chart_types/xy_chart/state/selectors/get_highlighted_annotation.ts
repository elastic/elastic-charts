/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DOMElementType } from '../../../../state/actions/dom_element';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { AnnotationType } from '../../utils/specs';
import { getMultipleRectangleAnnotations } from './get_multiple_rectangle_annotations';

const getHoveredDOMElement = (state: GlobalChartState) => state.interactions.hoveredDOMElement;

/** @internal */
export const getHighlightedAnnotationIdsSelector = createCustomCachedSelector(
  [getHoveredDOMElement, getMultipleRectangleAnnotations],
  (hoveredDOMElement, rectAnnotationTooltips): string[] => {
    const ids: string[] = (rectAnnotationTooltips ?? [])
      .filter(({ annotationType, isVisible }) => isVisible && annotationType === AnnotationType.Rectangle)
      .map(({ id }) => id);
    if (hoveredDOMElement?.type === DOMElementType.LineAnnotationMarker && hoveredDOMElement?.id) {
      ids.push(hoveredDOMElement.id);
    }
    return ids;
  },
);
