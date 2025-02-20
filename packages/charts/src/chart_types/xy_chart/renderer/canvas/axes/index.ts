/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderAxisLine } from './line';
import { renderTicks } from './tick';
import { renderTickLabel } from './tick_label';
import { Dimensions, Size } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { AxisStyle } from '../../../../../utils/themes/theme';
import { PerPanelAxisGeoms } from '../../../state/selectors/compute_per_panel_axes_geoms';
import { AxisTick, TickLabelBounds, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisSpec } from '../../../utils/specs';

/** @internal */
export interface AxisProps {
  panelTitle?: string;
  secondary?: boolean;
  panelAnchor: Point;
  axisStyle: AxisStyle; // todo rename to just style (it's in Axis... already)
  axisSpec: AxisSpec; // todo rename to just spec (it's in Axis... already)
  size: Size;
  anchorPoint: Point;
  dimension: TickLabelBounds;
  ticks: AxisTick[];
  debug: boolean;
  renderingArea: Dimensions;
  layerGirth: number;
  multilayerTimeAxis: boolean;
}

/** @internal */
export interface AxesProps {
  axesSpecs: AxisSpec[];
  perPanelAxisGeoms: PerPanelAxisGeoms[];
  axesStyles: Map<string, AxisStyle | null>;
  sharedAxesStyle: AxisStyle;
  debug: boolean;
  renderingArea: Dimensions;
}

/** @internal */
export function renderAxis(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const { ticks, axisStyle, axisSpec, secondary, layerGirth } = props;
  const showTicks = shouldShowTicks(axisStyle.tickLine, axisSpec.hide);

  if (!secondary && showTicks) {
    renderTicks(ctx, ticks, props);
  }
  if (!secondary && axisStyle.tickLabel.visible)
    ticks.forEach((tick) => renderTickLabel(ctx, tick, showTicks, props, layerGirth ?? 0));
  renderAxisLine(ctx, props);
}
