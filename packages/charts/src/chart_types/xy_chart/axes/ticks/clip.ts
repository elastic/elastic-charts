/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './labels';
import { Position } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { innerPad, outerPad } from '../../../../utils/dimensions';
import type { AxisStyle } from '../../../../utils/themes/theme';
import { isHorizontalAxis } from '../../utils/axis_type_utils';
import { shouldShowTicks } from '../../utils/axis_utils';
import type { AxisSpec } from '../../utils/specs';
import { getTitleDimension } from '../dimensions';

/** @internal */
export const tickLabelsClippingBox = ({
  spec,
  style,
  size,
  maxLabelBox,
}: {
  spec: AxisSpec;
  style: AxisStyle;
  size: Size;
  maxLabelBox: TickLabelBox;
}) => {
  const showTicks = shouldShowTicks(style.tickLine, spec.hide);

  const isHorizontal = isHorizontalAxis(spec.position);
  const hasTitle = style.axisTitle?.visible && spec.title && spec.title.length > 0;
  const titleDimension = hasTitle ? getTitleDimension(style.axisTitle) : 0;

  const inner = (showTicks ? style.tickLine.size + style.tickLine.padding : 0) + innerPad(style.tickLabel.padding);

  const outer = titleDimension + outerPad(style.tickLabel.padding);

  const [start, end] =
    spec.position === Position.Left || spec.position === Position.Top ? [outer, inner] : [inner, outer];

  return {
    x: isHorizontal ? -maxLabelBox.bboxWidth : start,
    y: isHorizontal ? start : -maxLabelBox.bboxHeight,
    width: isHorizontal ? size.width + 2 * maxLabelBox.bboxWidth : size.width - start - end,
    height: isHorizontal ? size.height - start - end : size.height + 2 * maxLabelBox.bboxHeight,
  };
};
