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
import { RectAnnotationStyle } from '../../../../../utils/themes/theme';
import { AnnotationRectProps } from '../../../annotations/rect/types';
import { GetAnnotationParamsFn } from '../../common/utils';
import { AnimationContext } from '../animations';
import { renderRect } from '../primitives/rect';
import { withPanelTransform } from '../utils/panel_transform';

/** @internal */
export function renderRectAnnotations(
  ctx: CanvasRenderingContext2D,
  aCtx: AnimationContext,
  annotations: AnnotationRectProps[],
  rectStyle: RectAnnotationStyle,
  getHoverParams: GetAnnotationParamsFn,
  rotation: Rotation,
  renderingArea: Dimensions,
) {
  const getFillAndStroke = (id: string): [Fill, Stroke] => {
    const { style, options } = getHoverParams(id);

    const opacityKey = `anno-rect-opacity--${id}`;
    const hoverOpacity = aCtx.getValue(options)(opacityKey, style.opacity);

    const fill: Fill = {
      color: overrideOpacity(colorToRgba(rectStyle.fill), (opacity) => opacity * rectStyle.opacity * hoverOpacity),
    };
    const stroke: Stroke = {
      color: overrideOpacity(colorToRgba(rectStyle.stroke), (opacity) => opacity * rectStyle.opacity * hoverOpacity),
      width: rectStyle.strokeWidth,
    };

    return [fill, stroke];
  };

  annotations.forEach(({ rect, panel, id }) =>
    withPanelTransform(ctx, panel, rotation, renderingArea, () => renderRect(ctx, rect, ...getFillAndStroke(id))),
  );
}
