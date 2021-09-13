/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba } from '../../../../../common/color_calcs';
import { overrideOpacity } from '../../../../../common/color_library_wrappers';
import { Fill, Stroke } from '../../../../../geoms/types';
import { Rotation } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { RectAnnotationStyle } from '../../../../../utils/themes/theme';
import { AnnotationRectProps } from '../../../annotations/rect/types';
import { renderRect } from '../primitives/rect';
import { withPanelTransform } from '../utils/panel_transform';

/** @internal */
export function renderRectAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: AnnotationRectProps[],
  rectStyle: RectAnnotationStyle,
  rotation: Rotation,
  renderingArea: Dimensions,
) {
  const fill: Fill = {
    color: overrideOpacity(colorToRgba(rectStyle.fill), (opacity) => opacity * rectStyle.opacity),
  };
  const stroke: Stroke = {
    color: overrideOpacity(colorToRgba(rectStyle.stroke), (opacity) => opacity * rectStyle.opacity),
    width: rectStyle.strokeWidth,
  };

  annotations.forEach(({ rect, panel }) =>
    withPanelTransform(ctx, panel, rotation, renderingArea, () => renderRect(ctx, rect, fill, stroke)),
  );
}
