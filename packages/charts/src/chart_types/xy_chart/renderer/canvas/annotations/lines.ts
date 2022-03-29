/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../../../common/color_library_wrappers';
import { Stroke } from '../../../../../geoms/types';
import { Rotation } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { GeometryStyle, LineAnnotationStyle } from '../../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { AnimationContext } from '../animations';
import { renderMultiLine } from '../primitives/line';
import { withPanelTransform } from '../utils/panel_transform';

/** @internal */
export function renderLineAnnotations(
  ctx: CanvasRenderingContext2D,
  aCtx: AnimationContext,
  annotations: AnnotationLineProps[],
  lineStyle: LineAnnotationStyle,
  getHoverStyle: (id: string) => GeometryStyle,
  rotation: Rotation,
  renderingArea: Dimensions,
) {
  const getAnimatedValue = aCtx.getValue({
    delay: 'slow',
    duration: 'slow',
    snapValues: [1],
  });

  const getStroke = (id: string): Stroke => {
    const op = getHoverStyle(id).opacity;
    const hoverOpacity = getAnimatedValue<number>(`anno-line-opacity-${id}`, op);

    const strokeColor = overrideOpacity(
      colorToRgba(lineStyle.line.stroke),
      (opacity) => opacity * lineStyle.line.opacity * hoverOpacity,
    );
    return {
      color: strokeColor,
      width: lineStyle.line.strokeWidth,
      dash: lineStyle.line.dash,
    };
  };

  annotations.forEach(({ linePathPoints, panel, id }) =>
    withPanelTransform(ctx, panel, rotation, renderingArea, () =>
      renderMultiLine(ctx, [linePathPoints], getStroke(id)),
    ),
  );
}
