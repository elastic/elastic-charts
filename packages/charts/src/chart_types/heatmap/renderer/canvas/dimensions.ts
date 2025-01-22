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

const graySemiTransparent = [...Colors.Gray.rgba.slice(0, 3), 0.2] as RgbaTuple;

/** @internal */
export const renderChartContainerDimensions = (ctx: CanvasRenderingContext2D, chartContainerDimensions: Dimensions) => {
  renderDebugRect(
    ctx,
    {
      x: chartContainerDimensions.left,
      y: chartContainerDimensions.top,
      width: chartContainerDimensions.width,
      height: chartContainerDimensions.height,
    },
    0,
    { color: graySemiTransparent },
  );
};

/** @internal */
export const renderChartDimensions = (ctx: CanvasRenderingContext2D, chartDimensions: Dimensions) => {
  renderDebugRect(
    ctx,
    {
      x: chartDimensions.left,
      y: chartDimensions.top,
      width: chartDimensions.width,
      height: chartDimensions.height,
    },
    0,
    { color: Colors.Transparent.rgba },
    { color: Colors.Red.rgba, width: 1, dash: [4, 4] },
  );
};
