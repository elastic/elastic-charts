/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../../../common/color_library_wrappers';
import { Stroke } from '../../../../../geoms/types';
import { renderMultiLine } from '../../../../../renderers/canvas/primitives/line';
import { Rotation } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { LineAnnotationStyle } from '../../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { GetAnnotationParamsFn } from '../../common/utils';
import { AnimationContext } from '../animations';
import { withPanelTransform } from '../utils/panel_transform';

/** @internal */
export function renderLineAnnotations(
  ctx: CanvasRenderingContext2D,
  aCtx: AnimationContext,
  annotations: AnnotationLineProps[],
  lineStyle: LineAnnotationStyle,
  getHoverParams: GetAnnotationParamsFn,
  rotation: Rotation,
  renderingArea: Dimensions,
) {
  const getStroke = (id: string): Stroke => {
    const { style, options } = getHoverParams(id);
    const opacityKey = `anno-rect-opacity--${id}`;
    const hoverOpacity = aCtx.getValue(options)(opacityKey, style.opacity);
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
