/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../../../common/color_library_wrappers';
import type { Fill, Stroke } from '../../../../../geoms/types';
import { renderRect } from '../../../../../renderers/canvas/primitives/rect';
import type { Rotation } from '../../../../../utils/common';
import type { Dimensions } from '../../../../../utils/dimensions';
import type { RectAnnotationStyle } from '../../../../../utils/themes/theme';
import type { AnnotationRectProps } from '../../../annotations/rect/types';
import type { GetAnnotationParamsFn } from '../../common/utils';
import type { AnimationContext } from '../animations';
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
