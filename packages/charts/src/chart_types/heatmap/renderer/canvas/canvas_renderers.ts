/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color, Colors } from '../../../../common/colors';
import { Font } from '../../../../common/text_utils';
import { clearCanvas, renderLayers, withContext } from '../../../../renderers/canvas';
import { renderMultiLine } from '../../../xy_chart/renderer/canvas/primitives/line';
import { renderRect } from '../../../xy_chart/renderer/canvas/primitives/rect';
import { renderText, wrapLines } from '../../../xy_chart/renderer/canvas/primitives/text';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { limitXAxisLabelRotation } from '../../layout/viewmodel/default_constaints';
import { ChartElementSizes } from '../../state/selectors/compute_chart_dimensions';

/** @internal */
export function renderCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  { theme, heatmapViewModel }: ShapeViewModel,
  background: Color,
  elementSizes: ChartElementSizes,
  debug: boolean,
) {
  withContext(ctx, () => {
    // set some defaults for the overall rendering

    // let's set the devicePixelRatio once and for all; then we'll never worry about it again
    ctx.scale(dpr, dpr);

    // all texts are currently center-aligned because
    //     - the calculations manually compute and lay out text (word) boxes, so we can choose whatever
    //     - but center/middle has mathematical simplicity and the most unassuming thing
    //     - due to using the math x/y convention (+y is up) while Canvas uses screen convention (+y is down)
    //         text rendering must be y-flipped, which is a bit easier this way
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // ctx.translate(chartCenter.x, chartCenter.y);
    // this applies the mathematical x/y conversion (+y is North) which is easier when developing geometry
    // functions - also, all renderers have flexibility (eg. SVG scale) and WebGL NDC is also +y up
    // - in any case, it's possible to refactor for a -y = North convention if that's deemed preferable
    // ctx.scale(1, -1);

    // TODO this should be filtered by the pageSize AND the pageNumber
    const filteredCells = heatmapViewModel.cells.filter((cell) => cell.yIndex < heatmapViewModel.pageSize);
    const filteredYValues = heatmapViewModel.yValues.filter((value, yIndex) => yIndex < heatmapViewModel.pageSize);

    renderLayers(ctx, [
      () => clearCanvas(ctx, background),
      () =>
        debug &&
        withContext(ctx, () => {
          ctx.strokeStyle = 'black';
          ctx.strokeRect(
            elementSizes.grid.left,
            elementSizes.grid.top,
            elementSizes.grid.width,
            elementSizes.grid.height,
          );

          ctx.strokeStyle = 'red';
          ctx.strokeRect(
            elementSizes.xAxis.left,
            elementSizes.xAxis.top,
            elementSizes.xAxis.width,
            elementSizes.xAxis.height,
          );

          ctx.strokeStyle = 'violet';
          ctx.strokeRect(
            elementSizes.yAxis.left,
            elementSizes.yAxis.top,
            elementSizes.yAxis.width,
            elementSizes.yAxis.height,
          );
        }),
      () => {
        // Grid
        withContext(ctx, () => {
          renderMultiLine(ctx, heatmapViewModel.gridLines.x, heatmapViewModel.gridLines.stroke);
          renderMultiLine(ctx, heatmapViewModel.gridLines.y, heatmapViewModel.gridLines.stroke);
        });
      },

      () =>
        // Cells
        withContext(ctx, () => {
          const { x, y } = heatmapViewModel.gridOrigin;
          ctx.translate(x, y);
          filteredCells.forEach((cell) => {
            if (cell.visible) renderRect(ctx, cell, cell.fill, cell.stroke);
          });
        }),

      () =>
        withContext(ctx, () => {
          // Text on cells
          const { x, y } = heatmapViewModel.gridOrigin;
          ctx.translate(x, y);
          filteredCells.forEach((cell) => {
            const fontSize = heatmapViewModel.cellFontSize(cell);
            if (cell.visible && Number.isFinite(fontSize))
              renderText(ctx, { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, cell.formatted, {
                ...theme.cell.label,
                fontSize,
                align: 'center',
                baseline: 'middle',
                textColor: cell.textColor,
              });
          });
        }),

      () =>
        // render text on Y axis
        theme.yAxisLabel.visible &&
        withContext(ctx, () => {
          ctx.translate(elementSizes.yAxis.left + elementSizes.yAxis.width, elementSizes.yAxis.top);
          filteredYValues.forEach((yValue) => {
            const font: Font = {
              fontFamily: theme.yAxisLabel.fontFamily,
              fontStyle: theme.yAxisLabel.fontStyle ? theme.yAxisLabel.fontStyle : 'normal',
              fontVariant: 'normal',
              fontWeight: 'normal',
              textColor: Colors.Black.keyword,
            };
            const { padding } = theme.yAxisLabel;
            const horizontalPadding =
              typeof padding === 'number' ? padding * 2 : (padding.left ?? 0) + (padding.right ?? 0);
            const [resultText] = wrapLines(
              ctx,
              yValue.text,
              font,
              theme.yAxisLabel.fontSize,
              heatmapViewModel.gridOrigin.x - horizontalPadding,
              16,
              { shouldAddEllipsis: true, wrapAtWord: false },
            ).lines;
            renderText(
              ctx,
              { x: yValue.x, y: yValue.y },
              resultText,
              // the alignment for y axis labels is fixed to the right
              { ...theme.yAxisLabel, align: 'right' },
            );
          });
        }),

      () =>
        // render text on X axis
        theme.xAxisLabel.visible &&
        withContext(ctx, () => {
          ctx.translate(elementSizes.xAxis.left, elementSizes.xAxis.top);
          const rotation = limitXAxisLabelRotation(theme.xAxisLabel.rotation);
          heatmapViewModel.xValues.forEach(({ x, y, text, align }) => {
            // TODO fix style
            renderMultiLine(
              ctx,
              [
                {
                  x1: x,
                  x2: x,
                  y1: 0,
                  y2: 5,
                },
              ],
              { width: 1, dash: [], color: [0, 0, 0, 1] },
            );
            renderText(ctx, { x, y }, text, { ...theme.xAxisLabel, align }, rotation);
          });
        }),

      () =>
        withContext(ctx, () => {
          heatmapViewModel.titles
            .filter((t) => t.visible && t.text !== '')
            .forEach((title) => {
              renderText(
                ctx,
                title.origin,
                title.text,
                {
                  ...title,
                  baseline: 'middle',
                  align: 'center',
                },
                title.rotation,
              );
            });
        }),
    ]);
  });
}
