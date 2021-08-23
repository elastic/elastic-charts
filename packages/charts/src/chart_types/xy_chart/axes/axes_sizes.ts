/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SmallMultiplesSpec } from '../../../specs';
import { Position } from '../../../utils/common';
import { innerPad, outerPad, PerSideDistance } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { AxisStyle, Theme } from '../../../utils/themes/theme';
import { getSpecsById } from '../state/utils/spec';
import { isVerticalAxis } from '../utils/axis_type_utils';
import { AxisViewModel, getTitleDimension, shouldShowTicks } from '../utils/axis_utils';
import { AxisSpec } from '../utils/specs';

/** @internal */
export function computeAxesSizes(
  { axes: sharedAxesStyles, chartMargins }: Theme,
  axisDimensions: Map<AxisId, AxisViewModel>,
  axesStyles: Map<AxisId, AxisStyle | null>,
  axisSpecs: AxisSpec[],
  smSpec?: SmallMultiplesSpec,
): PerSideDistance & { margin: { left: number } } {
  const axisMainSize: PerSideDistance = { left: 0, right: 0, top: 0, bottom: 0 };
  const axisLabelOverflow: PerSideDistance = { left: 0, right: 0, top: 0, bottom: 0 };

  axisDimensions.forEach(({ maxLabelBboxWidth = 0, maxLabelBboxHeight = 0, isHidden }, id) => {
    const axisSpec = getSpecsById<AxisSpec>(axisSpecs, id);
    if (isHidden || !axisSpec) {
      return;
    }
    const { position, title } = axisSpec;
    const { tickLine, axisTitle, axisPanelTitle, tickLabel } = axesStyles.get(id) ?? sharedAxesStyles;
    const hasPanelTitle = Boolean(isVerticalAxis(position) ? smSpec?.splitVertically : smSpec?.splitHorizontally);
    const panelTitleDimension = hasPanelTitle ? getTitleDimension(axisPanelTitle) : 0;
    const labelPaddingSum = tickLabel.visible ? innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;
    const titleDimension = title ? getTitleDimension(axisTitle) : 0;
    const tickDimension = shouldShowTicks(tickLine, axisSpec.hide) ? tickLine.size + tickLine.padding : 0;
    const axisDimension = labelPaddingSum + tickDimension + titleDimension + panelTitleDimension;

    // TODO use first and last labels
    if (isVerticalAxis(position)) {
      axisLabelOverflow.top = Math.max(axisLabelOverflow.top, maxLabelBboxHeight / 2);
      axisLabelOverflow.bottom = Math.max(axisLabelOverflow.bottom, maxLabelBboxHeight / 2);
      const maxAxisWidth = axisDimension + (tickLabel.visible ? maxLabelBboxWidth : 0);
      axisMainSize.left += position === Position.Left ? maxAxisWidth + chartMargins.left : 0;
      axisMainSize.right += position === Position.Right ? maxAxisWidth + chartMargins.right : 0;
    } else {
      // find the max half label size to accommodate the left/right labels
      axisLabelOverflow.left = Math.max(axisLabelOverflow.left, maxLabelBboxWidth / 2);
      axisLabelOverflow.right = Math.max(axisLabelOverflow.right, maxLabelBboxWidth / 2);
      const maxAxisHeight = axisDimension + (tickLabel.visible ? maxLabelBboxHeight : 0);
      axisMainSize.top += position === Position.Top ? maxAxisHeight + chartMargins.top : 0;
      axisMainSize.bottom += position === Position.Bottom ? maxAxisHeight + chartMargins.bottom : 0;
    }
  });

  const left = Math.max(axisLabelOverflow.left + chartMargins.left, axisMainSize.left);
  const right = Math.max(axisLabelOverflow.right + chartMargins.right, axisMainSize.right);
  const top = Math.max(axisLabelOverflow.top + chartMargins.top, axisMainSize.top);
  const bottom = Math.max(axisLabelOverflow.bottom + chartMargins.bottom, axisMainSize.bottom);
  return { left, right, top, bottom, margin: { left: left - axisMainSize.left } };
}
