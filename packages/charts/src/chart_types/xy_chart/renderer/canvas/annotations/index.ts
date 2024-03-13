/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderLineAnnotations } from './lines';
import { renderRectAnnotations } from './rect';
import { Rotation } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { AnnotationId } from '../../../../../utils/ids';
import {
  mergeWithDefaultAnnotationLine,
  mergeWithDefaultAnnotationRect,
} from '../../../../../utils/themes/merge_utils';
import { LineAnnotationStyle, RectAnnotationStyle, SharedGeometryStateStyle } from '../../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { AnnotationRectProps } from '../../../annotations/rect/types';
import { AnnotationDimensions } from '../../../annotations/types';
import { getSpecsById } from '../../../state/utils/spec';
import { AnnotationSpec, isLineAnnotation, isRectAnnotation } from '../../../utils/specs';
import { getAnnotationHoverParamsFn } from '../../common/utils';
import { AnimationContext } from '../animations';

/** @internal */
export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  aCtx: AnimationContext,
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>,
  annotationSpecs: AnnotationSpec[],
  rotation: Rotation,
  renderingArea: Dimensions,
  sharedStyle: SharedGeometryStateStyle,
  hoveredAnnotationIds: string[],
  lineAnnotationStyle: LineAnnotationStyle,
  rectAnnotationStyle: RectAnnotationStyle,
  renderOnBackground: boolean = true,
) {
  annotationDimensions.forEach((annotation, id) => {
    const spec = getSpecsById<AnnotationSpec>(annotationSpecs, id);
    const isBackground = (spec?.zIndex ?? 0) <= 0;

    if (spec && isBackground === renderOnBackground) {
      const getHoverParams = getAnnotationHoverParamsFn(hoveredAnnotationIds, sharedStyle, spec.animations);
      if (isLineAnnotation(spec)) {
        const lineStyle = mergeWithDefaultAnnotationLine(lineAnnotationStyle, spec.style);
        renderLineAnnotations(
          ctx,
          aCtx,
          annotation as AnnotationLineProps[],
          lineStyle,
          getHoverParams,
          rotation,
          renderingArea,
        );
      } else if (isRectAnnotation(spec)) {
        const rectStyle = mergeWithDefaultAnnotationRect(rectAnnotationStyle, spec.style);
        renderRectAnnotations(
          ctx,
          aCtx,
          annotation as AnnotationRectProps[],
          rectStyle,
          getHoverParams,
          rotation,
          renderingArea,
        );
      }
    }
  });
}
