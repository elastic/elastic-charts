/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withContext } from '../../../../renderers/canvas';
import { renderMultiLine } from '../../../../renderers/canvas/primitives/line';
import { Dimensions } from '../../../../utils/dimensions';
import { AxisStyle } from '../../../../utils/themes/theme';
import { LinesGrid } from '../../utils/grid_lines';
import { AxisSpec } from '../../utils/specs';

interface GridProps {
  sharedAxesStyle: AxisStyle;
  perPanelGridLines: Array<LinesGrid>;
  axesSpecs: AxisSpec[];
  renderingArea: Dimensions;
  axesStyles: Map<string, AxisStyle | null>;
}

/** @internal */
export function renderGrids(
  ctx: CanvasRenderingContext2D,
  { perPanelGridLines, renderingArea: { left, top } }: GridProps,
) {
  withContext(ctx, () => {
    ctx.translate(left, top);
    perPanelGridLines.forEach(({ lineGroups, panelAnchor: { x, y } }) => {
      withContext(ctx, () => {
        ctx.translate(x, y);
        lineGroups.forEach(({ lines, stroke }) => renderMultiLine(ctx, lines, stroke));
      });
    });
  });
}
