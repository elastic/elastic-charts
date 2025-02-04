/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeAnnotationDimensionsSelector } from './compute_annotations';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getAnnotationSpecsSelector } from './get_specs';
import { getTooltipInfoSelector } from './get_tooltip_values_highlighted_geoms';
import { TooltipPortalSettings } from '../../../../components/portal/types';
import { TooltipInfo } from '../../../../components/tooltip/types';
import { DOMElement } from '../../../../state/actions/dom_element';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { AnnotationId } from '../../../../utils/ids';
import { Point } from '../../../../utils/point';
import { AnnotationLineProps } from '../../annotations/line/types';
import { AnnotationRectProps } from '../../annotations/rect/types';
import { computeRectAnnotationTooltipState } from '../../annotations/tooltip';
import { AnnotationTooltipState, AnnotationDimensions } from '../../annotations/types';
import { AnnotationSpec, AnnotationType } from '../../utils/specs';
import { ComputedGeometries } from '../utils/types';

const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;
const getHoveredDOMElement = (state: GlobalChartState) => state.interactions.hoveredDOMElement;

/** @internal */
export const getAnnotationTooltipStateSelector = createCustomCachedSelector(
  [
    getCurrentPointerPosition,
    computeChartDimensionsSelector,
    computeSeriesGeometriesSelector,
    getChartRotationSelector,
    getAnnotationSpecsSelector,
    computeAnnotationDimensionsSelector,
    getTooltipInfoSelector,
    getHoveredDOMElement,
  ],
  getAnnotationTooltipState,
);

function getAnnotationTooltipState(
  cursorPosition: Point,
  {
    chartDimensions,
  }: {
    chartDimensions: Dimensions;
  },
  geometries: ComputedGeometries,
  chartRotation: Rotation,
  annotationSpecs: AnnotationSpec[],
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>,
  tooltip: TooltipInfo,
  hoveredDOMElement: DOMElement | null,
): AnnotationTooltipState | null {
  const hoveredTooltip = getTooltipStateForDOMElements(
    chartDimensions,
    annotationSpecs,
    annotationDimensions,
    hoveredDOMElement,
  );

  if (hoveredTooltip) {
    return hoveredTooltip;
  }
  // get positions relative to chart
  if (cursorPosition.x < 0 || cursorPosition.y < 0) {
    return null;
  }
  const { xScale, yScales } = geometries.scales;
  // only if we have a valid cursor position and the necessary scale
  if (!xScale || !yScales) {
    return null;
  }
  const tooltipState = computeRectAnnotationTooltipState(
    cursorPosition,
    annotationDimensions,
    annotationSpecs,
    chartRotation,
    chartDimensions,
  );

  // If there's a highlighted chart element tooltip value, don't show annotation tooltip
  const isChartTooltipDisplayed = tooltip.values.some(({ isHighlighted }) => isHighlighted);
  if (
    tooltipState &&
    tooltipState.isVisible &&
    tooltipState.annotationType === AnnotationType.Rectangle &&
    isChartTooltipDisplayed
  ) {
    return null;
  }

  return tooltipState;
}

/** @internal */
export function getTooltipStateForDOMElements(
  chartDimensions: Dimensions,
  annotationSpecs: AnnotationSpec[],
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>,
  hoveredDOMElement: DOMElement | null,
): AnnotationTooltipState | null {
  if (!hoveredDOMElement) {
    return null;
  }
  // current type for hoveredDOMElement is only used for line annotation markers
  // and we can safety cast the union types to the respective Line types
  const spec = annotationSpecs.find(({ id }) => id === hoveredDOMElement.createdBySpecId);
  if (!spec || spec.hideTooltips) {
    return null;
  }
  const dimension = (annotationDimensions.get(hoveredDOMElement.createdBySpecId) ?? [])
    .filter(isAnnotationLineProps)
    .find(({ id }) => id === hoveredDOMElement.id);

  if (!dimension) {
    return null;
  }

  return {
    id: dimension.id,
    specId: spec.id,
    isVisible: true,
    annotationType: AnnotationType.Line,
    datum: dimension.datum,
    anchor: {
      y: (dimension.markers[0]?.position.top ?? 0) + dimension.panel.top + chartDimensions.top,
      x: (dimension.markers[0]?.position.left ?? 0) + dimension.panel.left + chartDimensions.left,
      width: 0,
      height: 0,
    },
    customTooltipDetails: spec.customTooltipDetails,
    customTooltip: spec.customTooltip,
    tooltipSettings: getTooltipSettings(spec),
  };
}

function isAnnotationLineProps(prop: AnnotationLineProps | AnnotationRectProps): prop is AnnotationLineProps {
  return 'linePathPoints' in prop;
}

function getTooltipSettings({
  placement,
  fallbackPlacements,
  boundary,
  offset,
}: AnnotationSpec): TooltipPortalSettings<'chart'> {
  return {
    placement,
    fallbackPlacements,
    boundary,
    offset,
  };
}
