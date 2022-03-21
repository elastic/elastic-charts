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
import { mergeWithDefaultAnnotationRect } from '../../../../utils/themes/merge_utils';
import { AnnotationType, RectAnnotationSpec } from '../../utils/specs';
import { getMultipleRectangleAnnotations } from './get_multiple_rectangle_annotations';
import { getAnnotationSpecsSelector } from './get_specs';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';

const getHoveredDOMElement = (state: GlobalChartState) => state.interactions.hoveredDOMElement;

/** @internal */
export const getHighlightedAnnotationIdsSelector = createCustomCachedSelector(
  [getHoveredDOMElement, getMultipleRectangleAnnotations, getAnnotationSpecsSelector, getHighlightedGeomsSelector],
  (hoveredDOMElement, rectAnnotationTooltips, specs, highlightedGeoms): string[] => {
    // TODO: Remove when annotation tooltip is itegrated into main tooltip
    if (highlightedGeoms.length > 0) return [];

    const ids: string[] = [];

    // TODO: restore when rect annotation usage is determined
    (rectAnnotationTooltips ?? [])
      .filter(({ annotationType, isVisible, specId }) => {
        const rectSpec = specs.find((d) => d.id === specId) as RectAnnotationSpec;
        if (!rectSpec) {
          return false;
        }
        const rectStyle = mergeWithDefaultAnnotationRect(rectSpec.style);
        return rectStyle.fadeOut && isVisible && annotationType === AnnotationType.Rectangle;
      })
      .forEach(({ id }) => ids.push(id));
    if (hoveredDOMElement?.type === DOMElementType.LineAnnotationMarker && hoveredDOMElement?.id) {
      ids.push(hoveredDOMElement.id);
    }
    return ids;
  },
);
