/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../../../common/color_library_wrappers';
import { Fill, Stroke } from '../../../../../geoms/types';
import { Rotation } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { SpecId } from '../../../../../utils/ids';
import { RectAnnotationStyle } from '../../../../../utils/themes/theme';
import { AnnotationRectProps } from '../../../annotations/rect/types';
import { AnnotationHoverParams } from '../../common/utils';
import { AnimationContext } from '../animations';
import { renderRect } from '../primitives/rect';
import { withPanelTransform } from '../utils/panel_transform';

/** @internal */
export function renderRectAnnotations(
  ctx: CanvasRenderingContext2D,
  aCtx: AnimationContext,
  annotations: AnnotationRectProps[],
  rectStyle: RectAnnotationStyle,
  getHoverParams: (id: string) => AnnotationHoverParams,
  rotation: Rotation,
  renderingArea: Dimensions,
) {
  const getAnimatedValue = aCtx.getValue(rectStyle.animations);
  const getFillAndStroke = (id: string, specId: SpecId): [Fill, Stroke] => {
    const { style, isHighlighted } = getHoverParams(id);
    const highlightedOpacity = getAnimatedValue(`anno-rect-${specId}-opacity-highlighted`, style.opacity);
    const unhighlightedOpacity = getAnimatedValue(`anno-rect-${specId}-opacity-unhighlighted`, style.opacity);
    const hoverOpacity = isHighlighted ? highlightedOpacity : unhighlightedOpacity;

    const fill: Fill = {
      color: overrideOpacity(colorToRgba(rectStyle.fill), (opacity) => opacity * rectStyle.opacity * hoverOpacity),
    };
    const stroke: Stroke = {
      color: overrideOpacity(colorToRgba(rectStyle.stroke), (opacity) => opacity * rectStyle.opacity * hoverOpacity),
      width: rectStyle.strokeWidth,
    };

    return [fill, stroke];
  };

  annotations.forEach(({ rect, panel, id, specId }) =>
    withPanelTransform(ctx, panel, rotation, renderingArea, () =>
      renderRect(ctx, rect, ...getFillAndStroke(id, specId)),
    ),
  );
}
