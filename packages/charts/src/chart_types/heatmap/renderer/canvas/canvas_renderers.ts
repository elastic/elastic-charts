/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../../../common/colors';
import { clearCanvas, renderLayers, withContext } from '../../../../renderers/canvas';
import { radToDeg } from '../../../../utils/common';
import { horizontalPad } from '../../../../utils/dimensions';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { renderMultiLine } from '../../../xy_chart/renderer/canvas/primitives/line';
import { renderRect } from '../../../xy_chart/renderer/canvas/primitives/rect';
import { renderText, TextFont, wrapLines } from '../../../xy_chart/renderer/canvas/primitives/text';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { ChartElementSizes } from '../../state/selectors/compute_chart_dimensions';
import { getColorBandStyle, getGeometryStateStyle } from './utils';

/** @internal */
export function renderCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  { theme, heatmapViewModel }: ShapeViewModel,
  sharedGeometryStyle: SharedGeometryStateStyle,
  background: Color,
  elementSizes: ChartElementSizes,
  debug: boolean,
  highlightedLegendBands: Array<[start: number, end: number]>,
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
    ctx.lineCap = 'square';
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
            if (cell.visible) {
              const geometryStateStyle = getGeometryStateStyle(cell, sharedGeometryStyle, highlightedLegendBands);
              const style = getColorBandStyle(cell, geometryStateStyle);
              renderRect(ctx, cell, style.fill, style.stroke);
            }
          });
        }),

      () =>
        theme.cell.label.visible &&
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
          // the text is right aligned so the canvas needs to be aligned to the right of the Y axis box
          ctx.translate(elementSizes.yAxis.left + elementSizes.yAxis.width, elementSizes.yAxis.top);
          const font: TextFont = { ...theme.yAxisLabel, baseline: 'middle' /* fixed */, align: 'right' /* fixed */ };
          const { padding } = theme.yAxisLabel;
          const horizontalPadding = horizontalPad(padding);
          filteredYValues.forEach(({ x, y, text }) => {
            const textLines = wrapLines(
              ctx,
              text,
              font,
              theme.yAxisLabel.fontSize,
              Math.max(elementSizes.yAxis.width - horizontalPadding, 0),
              theme.yAxisLabel.fontSize,
              { shouldAddEllipsis: true, wrapAtWord: false },
            ).lines;
            // TODO improve the `wrapLines` code to handle results with short width
            renderText(ctx, { x, y }, textLines.length > 0 ? textLines[0] : '…', font);
          });
        }),

      () =>
        // render text on X axis
        theme.xAxisLabel.visible &&
        withContext(ctx, () => {
          ctx.translate(elementSizes.xAxis.left, elementSizes.xAxis.top);
          heatmapViewModel.xValues
            .filter((_, i) => i % elementSizes.xAxisTickCadence === 0)
            .forEach(({ x, y, text, align }) => {
              const textLines = wrapLines(
                ctx,
                text,
                theme.xAxisLabel,
                theme.xAxisLabel.fontSize,
                // TODO wrap into multilines
                Infinity,
                16,
                { shouldAddEllipsis: true, wrapAtWord: false },
              ).lines;
              renderText(
                ctx,
                { x, y },
                textLines.length > 0 ? textLines[0] : '…',
                { ...theme.xAxisLabel, baseline: 'middle', align },
                // negative rotation due to the canvas rotation direction
                radToDeg(-elementSizes.xLabelRotation),
              );
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
