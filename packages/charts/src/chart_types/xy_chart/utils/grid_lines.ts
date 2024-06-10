/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isVerticalAxis } from './axis_type_utils';
import { AxisGeometry, AxisTick } from './axis_utils';
import { AxisSpec } from './specs';
import { colorToRgba, overrideOpacity } from '../../../common/color_library_wrappers';
import { SmallMultipleScales, getPanelSize, getPerPanelMap } from '../../../common/panel_utils';
import { Line, Stroke } from '../../../geoms/types';
import { mergePartial, RecursivePartial } from '../../../utils/common';
import { Size } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { Point } from '../../../utils/point';
import { AxisStyle, Theme } from '../../../utils/themes/theme';
import { MIN_STROKE_WIDTH } from '../renderer/canvas/primitives/line';

/** @internal */
export const HIERARCHICAL_GRID_WIDTH = 1; // constant 1 scales well and solves some render issues due to fixed 1px wide overpaints
/** @internal */
export const OUTSIDE_RANGE_TOLERANCE = 0.01; // can protrude from the scale range by a max of 0.1px, to allow for FP imprecision
/** @internal */
export const HIDE_MINOR_TIME_GRID = false; // experimental: retain ticks but don't show grid lines for minor raster

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
      return linesForSpec.length === 0 ? linesAcc : linesAcc.concat(linesForSpec);
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

  if (!gridLineStyles.visible) {
    return [];
  }

  // define the stroke for the specific set of grid lines
  if (!gridLineStyles.stroke || !gridLineStyles.strokeWidth || gridLineStyles.strokeWidth < MIN_STROKE_WIDTH) {
    return [];
  }

  const visibleTicksPerLayer = visibleTicks.reduce((acc: Map<number, AxisTick[]>, tick) => {
    if (Math.abs(tick.position - tick.domainClampedPosition) > OUTSIDE_RANGE_TOLERANCE) return acc; // no gridline for ticks outside the domain
    if (typeof tick.layer === 'number' && !tick.showGrid) return acc; // no gridline for ticks outside the domain
    if (HIDE_MINOR_TIME_GRID && typeof tick.layer === 'number' && tick.detailedLayer === 0) return acc; // no gridline for ticks outside the domain
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
      const layered = typeof visibleTicksOfLayer[0]?.layer === 'number';

      const multilayerLuma = themeAxisStyle.gridLine.lumaSteps[detailedLayer] ?? NaN;
      const stroke: Stroke = {
        color: layered ? [multilayerLuma, multilayerLuma, multilayerLuma, 1] : strokeColor,
        width: layered ? HIERARCHICAL_GRID_WIDTH : gridLineStyles.strokeWidth,
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
