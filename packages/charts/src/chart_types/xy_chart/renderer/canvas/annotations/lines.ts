/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stringToRGB } from '../../../../../common/color_library_wrappers';
import { Stroke } from '../../../../../geoms/types';
import { Rotation } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { LineAnnotationStyle } from '../../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { renderMultiLine } from '../primitives/line';
import { withPanelTransform } from '../utils/panel_transform';

/** @internal */
export function renderLineAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: AnnotationLineProps[],
  lineStyle: LineAnnotationStyle,
  rotation: Rotation,
  renderingArea: Dimensions,
) {
  const strokeColor = stringToRGB(lineStyle.line.stroke);
  strokeColor.opacity *= lineStyle.line.opacity;
  const stroke: Stroke = {
    color: strokeColor,
    width: lineStyle.line.strokeWidth,
    dash: lineStyle.line.dash,
  };

  annotations.forEach(({ linePathPoints, panel }) => {
    withPanelTransform(ctx, panel, rotation, renderingArea, (ctx) => {
      renderMultiLine(ctx, [linePathPoints], stroke);
    });
  });
}
