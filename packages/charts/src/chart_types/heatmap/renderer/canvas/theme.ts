/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RgbaTuple } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { withContext } from '../../../../renderers/canvas';
import { renderDebugRect } from '../../../../renderers/canvas/utils/debug';
import { Dimensions, PerSideDistance } from '../../../../utils/dimensions';

const greenSemiTransparent = [...Colors.Green.rgba.slice(0, 3), 0.5] as RgbaTuple;
const lightBlueSemiTransparent = [...Colors.LightBlue.rgba.slice(0, 3), 0.5] as RgbaTuple;

/** @internal */
export const renderMargins = (
  ctx: CanvasRenderingContext2D,
  chartContainerDimensions: Dimensions,
  chartMargins: PerSideDistance,
) => {
  withContext(ctx, () => {
    // left
    renderDebugRect(
      ctx,
      {
        x: chartContainerDimensions.left,
        y: chartContainerDimensions.top,
        width: chartMargins.left,
        height: chartContainerDimensions.height,
      },
      0,
      { color: greenSemiTransparent },
    );
    // right
    renderDebugRect(
      ctx,
      {
        x: chartContainerDimensions.left + chartContainerDimensions.width - chartMargins.right,
        y: chartContainerDimensions.top,
        width: chartMargins.right,
        height: chartContainerDimensions.height,
      },
      0,
      { color: greenSemiTransparent },
    );
    // top
    renderDebugRect(
      ctx,
      {
        x: chartContainerDimensions.left,
        y: chartContainerDimensions.top,
        width: chartContainerDimensions.width,
        height: chartMargins.top,
      },
      0,
      { color: greenSemiTransparent },
    );
    // bottom
    renderDebugRect(
      ctx,
      {
        x: chartContainerDimensions.left,
        y: chartContainerDimensions.top + chartContainerDimensions.height - chartMargins.bottom,
        width: chartContainerDimensions.width,
        height: chartMargins.bottom,
      },
      0,
      { color: greenSemiTransparent },
    );
  });
};

/** @internal */
export const renderPaddings = (
  ctx: CanvasRenderingContext2D,
  chartContainerDimensions: Dimensions,
  chartDimensions: Dimensions,
  chartMargins: PerSideDistance,
  chartPaddings: PerSideDistance,
) => {
  withContext(ctx, () => {
    // left
    renderDebugRect(
      ctx,
      {
        x: chartDimensions.left - chartPaddings.left,
        y: chartContainerDimensions.top + chartPaddings.top + chartMargins.top,
        width: chartPaddings.left,
        height: chartDimensions.height,
      },
      0,
      { color: lightBlueSemiTransparent },
    );
    // right
    renderDebugRect(
      ctx,
      {
        x: chartContainerDimensions.left + chartContainerDimensions.width - chartPaddings.right - chartMargins.right,
        y: chartContainerDimensions.top + chartPaddings.top + chartMargins.top,
        width: chartPaddings.right,
        height: chartDimensions.height,
      },
      0,
      { color: lightBlueSemiTransparent },
    );
    // top
    renderDebugRect(
      ctx,
      {
        x: chartDimensions.left,
        y: chartContainerDimensions.top + chartMargins.top,
        width: chartDimensions.width,
        height: chartPaddings.top,
      },
      0,
      { color: lightBlueSemiTransparent },
    );
    // bottom
    renderDebugRect(
      ctx,
      {
        x: chartDimensions.left,
        y: chartContainerDimensions.top + chartDimensions.height + chartMargins.top + chartPaddings.top,
        width: chartDimensions.width,
        height: chartPaddings.bottom,
      },
      0,
      { color: lightBlueSemiTransparent },
    );
  });
};
