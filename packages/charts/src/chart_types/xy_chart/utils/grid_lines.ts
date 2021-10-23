/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../common/color_library_wrappers';
import { Line, Stroke } from '../../../geoms/types';
import { mergePartial, RecursivePartial } from '../../../utils/common';
import { Size } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { Point } from '../../../utils/point';
import { AxisStyle, Theme } from '../../../utils/themes/theme';
import { MIN_STROKE_WIDTH } from '../renderer/canvas/primitives/line';
import { SmallMultipleScales } from '../state/selectors/compute_small_multiple_scales';
import { isVerticalAxis } from './axis_type_utils';
import { AxisGeometry, AxisTick } from './axis_utils';
import { getPanelSize } from './panel';
import { getPerPanelMap } from './panel_utils';
import { AxisSpec } from './specs';

/** @internal */
export const lineThicknessSteps = [0.5, 0.75, 1, 1, 1, 1.25, 1.25, 1.5, 1.5, 1.75, 1.75, 2, 2, 2, 2, 2];
/** @internal */
export const lumaSteps = [192, 72, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];

/** @internal */
export interface GridLineGroup {
  lines: Array<Line>;
  stroke: Stroke;
  axisId: AxisId;
}

/** @internal */
export type LinesGrid = {
  panelAnchor: Point;
  lineGroups: Array<GridLineGroup>;
};

/** @internal */
export function getGridLines(
  axesSpecs: Array<AxisSpec>,
  axesGeoms: Array<AxisGeometry>,
  { axes: themeAxisStyle }: Pick<Theme, 'axes'>,
  scales: SmallMultipleScales,
): Array<LinesGrid> {
  const panelSize = getPanelSize(scales);
  return getPerPanelMap(scales, () => {
    // get grids per panel (depends on all the axis that exist)
    const lines = axesGeoms.reduce<Array<GridLineGroup>>((linesAcc, { axis, visibleTicks }) => {
      const axisSpec = axesSpecs.find(({ id }) => id === axis.id);
      if (!axisSpec) {
        return linesAcc;
      }
      const linesForSpec = getGridLinesForAxis(axisSpec, visibleTicks, themeAxisStyle, panelSize);
      if (linesForSpec.length === 0) {
        return linesAcc;
      }
      return [...linesAcc, ...linesForSpec];
    }, []);
    return { lineGroups: lines };
  });
}

function getGridLinesForAxis(
  axisSpec: AxisSpec,
  visibleTicks: AxisTick[],
  themeAxisStyle: AxisStyle,
  panelSize: Size,
): GridLineGroup[] {
  // vertical ==> horizontal grid lines
  const isVertical = isVerticalAxis(axisSpec.position);

  // merge the axis configured style with the theme style
  const axisStyle = mergePartial(themeAxisStyle, axisSpec.style as RecursivePartial<AxisStyle>);
  const gridLineThemeStyle = isVertical ? axisStyle.gridLine.vertical : axisStyle.gridLine.horizontal;

  // axis can have a configured grid line style
  const gridLineStyles = axisSpec.gridLine ? mergePartial(gridLineThemeStyle, axisSpec.gridLine) : gridLineThemeStyle;

  const showGridLines = axisSpec.showGridLines ?? gridLineStyles.visible;
  if (!showGridLines) {
    return [];
  }

  // define the stroke for the specific set of grid lines
  if (!gridLineStyles.stroke || !gridLineStyles.strokeWidth || gridLineStyles.strokeWidth < MIN_STROKE_WIDTH) {
    return [];
  }

  const visibleTicksPerLayer = visibleTicks.reduce((acc: Map<number, AxisTick[]>, tick) => {
    const ticks = acc.get(tick.detailedLayer);
    if (ticks) {
      ticks.push(tick);
    } else {
      acc.set(tick.detailedLayer, [tick]);
    }
    return acc;
  }, new Map());

  return [...visibleTicksPerLayer]
    .sort(([k1], [k2]) => (k1 ?? 0) - (k2 ?? 0)) // increasing layer order
    .map(([detailedLayer, visibleTicksOfLayer]) => {
      const lines = visibleTicksOfLayer.map<Line>((tick: AxisTick) =>
        isVertical
          ? getGridLineForVerticalAxisAt(tick.position, panelSize)
          : getGridLineForHorizontalAxisAt(tick.position, panelSize),
      );
      const strokeColor = overrideOpacity(colorToRgba(gridLineStyles.stroke), (strokeColorOpacity) =>
        gridLineStyles.opacity !== undefined ? strokeColorOpacity * gridLineStyles.opacity : strokeColorOpacity,
      );
      const layered = typeof visibleTicksOfLayer[0].layer === 'number';
      const stroke: Stroke = {
        color: layered
          ? [lumaSteps[detailedLayer], lumaSteps[detailedLayer], lumaSteps[detailedLayer], 1]
          : strokeColor,
        width: layered ? lineThicknessSteps[detailedLayer] : gridLineStyles.strokeWidth,
        dash: gridLineStyles.dash,
      };
      return { lines, stroke, axisId: axisSpec.id };
    });
}

/**
 * Get a horizontal grid line at `tickPosition`
 * used for vertical axis specs
 * @param tickPosition the position of the tick
 * @param panelSize the size of the target panel
 * @internal
 */
export function getGridLineForVerticalAxisAt(tickPosition: number, panelSize: Size): Line {
  return { x1: 0, y1: tickPosition, x2: panelSize.width, y2: tickPosition };
}

/**
 * Get a vertical grid line at `tickPosition`
 * used for horizontal axis specs
 * @param tickPosition the position of the tick
 * @param panelSize the size of the target panel
 * @internal
 */
export function getGridLineForHorizontalAxisAt(tickPosition: number, panelSize: Size): Line {
  return { x1: tickPosition, y1: 0, x2: tickPosition, y2: panelSize.height };
}
