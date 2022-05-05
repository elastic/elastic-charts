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
import { SpecId } from '../../../../../utils/ids';
import { LineAnnotationStyle } from '../../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { AnnotationHoverParams } from '../../common/utils';
import { AnimationContext } from '../animations';
import { renderMultiLine } from '../primitives/line';
import { withPanelTransform } from '../utils/panel_transform';

/** @internal */
export function renderLineAnnotations(
  ctx: CanvasRenderingContext2D,
  aCtx: AnimationContext,
  annotations: AnnotationLineProps[],
  lineStyle: LineAnnotationStyle,
  getHoverParams: (id: string) => AnnotationHoverParams,
  rotation: Rotation,
  renderingArea: Dimensions,
) {
  const getAnimatedValue = aCtx.getValue(lineStyle.animations);
  const getStroke = (id: string, specId: SpecId): Stroke => {
    const { style, isHighlighted } = getHoverParams(id);
    const highlightedOpacity = getAnimatedValue(`anno-line-${specId}-opacity-highlighted`, style.opacity);
    const unhighlightedOpacity = getAnimatedValue(`anno-line-${specId}-opacity-unhighlighted`, style.opacity);
    const hoverOpacity = isHighlighted ? highlightedOpacity : unhighlightedOpacity;
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

  annotations.forEach(({ linePathPoints, panel, id, specId }) =>
    withPanelTransform(ctx, panel, rotation, renderingArea, () =>
      renderMultiLine(ctx, [linePathPoints], getStroke(id, specId)),
    ),
  );
}
