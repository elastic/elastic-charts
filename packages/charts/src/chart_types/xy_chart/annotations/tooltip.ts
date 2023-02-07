/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getRectAnnotationTooltipState } from './rect/tooltip';
import { AnnotationRectProps } from './rect/types';
import { AnnotationDimensions, AnnotationTooltipState } from './types';
import { TooltipPortalSettings } from '../../../components/portal';
import { Rotation } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { AnnotationId } from '../../../utils/ids';
import { Point } from '../../../utils/point';
import { AnnotationSpec, isRectAnnotation } from '../utils/specs';

/** @internal */
export function computeRectAnnotationTooltipState(
  cursorPosition: Point,
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>,
  annotationSpecs: AnnotationSpec[],
  chartRotation: Rotation,
  chartDimensions: Dimensions,
): AnnotationTooltipState | null {
  // allow picking up the last spec added as the top most or use its zIndex value
  const sortedAnnotationSpecs = annotationSpecs
    .filter(isRectAnnotation)
    .sort(({ zIndex: a = Number.MIN_SAFE_INTEGER }, { zIndex: b = Number.MIN_SAFE_INTEGER }) => a - b);

  for (let i = 0; i < sortedAnnotationSpecs.length; i++) {
    const spec = sortedAnnotationSpecs[i];
    const annotationDimension = annotationDimensions.get(spec.id);
    if (spec.hideTooltips || !annotationDimension) {
      continue;
    }
    const { customTooltip, customTooltipDetails } = spec;

    const tooltipSettings = getTooltipSettings(spec);

    const rectAnnotationTooltipState = getRectAnnotationTooltipState(
      cursorPosition,
      annotationDimension as AnnotationRectProps[],
      chartRotation,
      chartDimensions,
      spec.id,
    );

    if (rectAnnotationTooltipState) {
      return {
        ...rectAnnotationTooltipState,
        tooltipSettings,
        customTooltip,
        customTooltipDetails: customTooltipDetails ?? spec.renderTooltip,
      };
    }
  }

  return null;
}

/** @internal */
export function computeMultipleRectAnnotationTooltipState(
  cursorPosition: Point,
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>,
  annotationSpecs: AnnotationSpec[],
  chartRotation: Rotation,
  chartDimensions: Dimensions,
): AnnotationTooltipState[] {
  // allow picking up the last spec added as the top most or use its zIndex value
  const sortedAnnotationSpecs = annotationSpecs
    .filter(isRectAnnotation)
    .sort(({ zIndex: a = Number.MIN_SAFE_INTEGER }, { zIndex: b = Number.MIN_SAFE_INTEGER }) => a - b);
  return sortedAnnotationSpecs.reduce<AnnotationTooltipState[]>((acc, spec) => {
    const annotationDimension = annotationDimensions.get(spec.id);
    if (!spec.hideTooltips && annotationDimension) {
      const { customTooltip, customTooltipDetails } = spec;

      const tooltipSettings = getTooltipSettings(spec);

      const rectAnnotationTooltipState = getRectAnnotationTooltipState(
        cursorPosition,
        annotationDimension as AnnotationRectProps[],
        chartRotation,
        chartDimensions,
        spec.id,
      );
      if (rectAnnotationTooltipState) {
        acc.push({
          ...rectAnnotationTooltipState,
          tooltipSettings,
          customTooltip,
          customTooltipDetails: customTooltipDetails ?? spec.renderTooltip,
        });
      }
    }
    return acc;
  }, [] as AnnotationTooltipState[]);
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
