/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMultipleRectangleAnnotations } from './get_multiple_rectangle_annotations';
import { getAnnotationSpecsSelector } from './get_specs';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import { DOMElementType } from '../../../../state/actions/dom_element';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { AnnotationType } from '../../utils/specs';

const getHoveredDOMElement = (state: GlobalChartState) => state.interactions.hoveredDOMElement;

/** @internal */
export const getHighlightedAnnotationIdsSelector = createCustomCachedSelector(
  [getHoveredDOMElement, getMultipleRectangleAnnotations, getAnnotationSpecsSelector, getHighlightedGeomsSelector],
  (hoveredDOMElement, rectAnnotationTooltips, specs, highlightedGeoms): string[] => {
    // TODO: Remove when annotation tooltip is integrated into main tooltip
    // This check is to prevent annotation fading when annotation is behind an actively hovered geometry element
    if (highlightedGeoms.length > 0) return [];

    // TODO: restore when rect annotation usage is determined
    const ids: string[] = (rectAnnotationTooltips ?? [])
      .filter(({ annotationType, isVisible }) => isVisible && annotationType === AnnotationType.Rectangle)
      .map(({ id }) => id);

    if (hoveredDOMElement?.type === DOMElementType.LineAnnotationMarker && hoveredDOMElement?.id) {
      ids.push(hoveredDOMElement.id);
    }
    return ids;
  },
);
