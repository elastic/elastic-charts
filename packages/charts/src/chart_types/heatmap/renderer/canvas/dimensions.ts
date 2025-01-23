/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RgbaTuple } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { renderDebugRect } from '../../../../renderers/canvas/utils/debug';
import { Dimensions } from '../../../../utils/dimensions';

/** @internal */
export const renderChartContainerDimensions = (ctx: CanvasRenderingContext2D, container: Dimensions) => {
  const graySemiTransparent = [...(Colors.Gray.rgba.slice(0, 3) as [number, number, number]), 0.5] satisfies RgbaTuple;

  renderDebugRect(
    ctx,
    {
      x: container.left,
      y: container.top,
      width: container.width,
      height: container.height,
    },
    0,
    { color: graySemiTransparent },
  );
};

/** @internal */
export const renderChartDimensions = (ctx: CanvasRenderingContext2D, chart: Dimensions) => {
  renderDebugRect(
    ctx,
    {
      x: chart.left,
      y: chart.top,
      width: chart.width,
      height: chart.height,
    },
    0,
    { color: Colors.Transparent.rgba },
    { color: Colors.Red.rgba, width: 1, dash: [4, 4] },
  );
};
