/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisLayoutContext } from './dimensions';
import { measureAxisBand } from './dimensions';
import { getMaxLabelDimensions, type TickLabelBox } from './ticks/labels';
import type { AxisTick } from './ticks/types';
import type { Projection } from './ticks/visible_ticks';
import type { SmallMultipleScales } from '../../../common/panel_utils';
import { getPanelSize } from '../../../common/panel_utils';
import { Position } from '../../../utils/common';
import type { Dimensions, PerSideDistance, Size } from '../../../utils/dimensions';
import type { AxisId } from '../../../utils/ids';
import type { Point } from '../../../utils/point';
import type { AxisStyle, Theme } from '../../../utils/themes/theme';
import type { JoinedAxisData } from '../state/selectors/compute_baseline_axes';
import { isVerticalAxis } from '../utils/axis_type_utils';
import type { AxisSpec } from '../utils/specs';

/** @internal */
export function getPosition(
  { chartDimensions }: { chartDimensions: Dimensions },
  chartMargins: PerSideDistance,
  axisStyle: AxisStyle,
  axisSpec: AxisSpec,
  tickLabels: TickLabelBox[],
  { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum }: PerSideDistance,
  layout: AxisLayoutContext,
) {
  const { position } = axisSpec;
  const vertical = isVerticalAxis(position);
  const bandSize = measureAxisBand(axisSpec, axisStyle, tickLabels, layout);

  return {
    leftIncrement: position === Position.Left ? bandSize + chartMargins.left : 0,
    rightIncrement: position === Position.Right ? bandSize + chartMargins.right : 0,
    topIncrement: position === Position.Top ? bandSize + chartMargins.top : 0,
    bottomIncrement: position === Position.Bottom ? bandSize + chartMargins.bottom : 0,
    dimensions: {
      left:
        position === Position.Left
          ? chartMargins.left + cumLeftSum
          : chartDimensions.left + (position === Position.Right ? chartDimensions.width + cumRightSum : 0),
      top:
        position === Position.Top
          ? chartMargins.top + cumTopSum
          : chartDimensions.top + (position === Position.Bottom ? chartDimensions.height + cumBottomSum : 0),
      width: vertical ? bandSize : chartDimensions.width,
      height: vertical ? chartDimensions.height : bandSize,
    },
  };
}

/** @internal */
export interface AxisGeometry {
  anchorPoint: Point;
  size: Size;
  parentSize: Size;
  axis: {
    id: AxisId;
    position: Position;
    panelTitle?: string; // defined later per panel
    secondary?: boolean; // defined later per panel
    multilayerTimeAxis: boolean;
  };
  dimension: TickLabelBox;
  visibleTicks: AxisTick[];
}

/** @internal */
export function getAxesGeometries(
  chartDims: { chartDimensions: Dimensions; leftMargin: number },
  { chartPaddings, chartMargins }: Theme,
  joinedAxesData: Map<AxisId, JoinedAxisData>,
  smScales: SmallMultipleScales,
  visibleTicksSet: Map<AxisId, Projection>,
): AxisGeometry[] {
  const panel = getPanelSize(smScales);

  return [...visibleTicksSet].reduce(
    (acc: PerSideDistance & { geoms: AxisGeometry[] }, [axisId, { ticks }]: [AxisId, Projection]) => {
      const joined = joinedAxesData.get(axisId);
      const tickLabels = ticks.map((tick) => tick.layout);
      const labelBox = getMaxLabelDimensions(tickLabels);

      if (joined) {
        const { axisSpec, axesStyle, layout } = joined;
        const vertical = isVerticalAxis(axisSpec.position);

        const { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement } = getPosition(
          chartDims,
          chartMargins,
          axesStyle,
          axisSpec,
          tickLabels,
          acc,
          layout,
        );
        acc.top += topIncrement;
        acc.bottom += bottomIncrement;
        acc.left += leftIncrement;
        acc.right += rightIncrement;
        acc.geoms.push({
          axis: { id: axisSpec.id, position: axisSpec.position, multilayerTimeAxis: layout.multilayerTimeAxis },
          anchorPoint: { x: dimensions.left, y: dimensions.top },
          dimension: labelBox,
          visibleTicks: ticks,
          parentSize: { height: dimensions.height, width: dimensions.width },
          size: {
            width: axisSpec.hide ? 0 : vertical ? dimensions.width : panel.width,
            height: axisSpec.hide ? 0 : vertical ? panel.height : dimensions.height,
          },
        });
      } else {
        throw new Error(`Cannot compute scale for axis spec ${axisId}`); // todo move this feedback as upstream as possible
      }
      return acc;
    },
    { geoms: [], top: 0, bottom: chartPaddings.bottom, left: chartDims.leftMargin, right: chartPaddings.right },
  ).geoms;
}
