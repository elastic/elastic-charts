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
import { Theme } from '../../../../utils/themes/theme';
import { renderMultiLine } from '../../../xy_chart/renderer/canvas/primitives/line';
import { renderRect } from '../../../xy_chart/renderer/canvas/primitives/rect';
import { renderText, wrapLines } from '../../../xy_chart/renderer/canvas/primitives/text';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { HeatmapSpec } from '../../specs/heatmap';

/** @internal */
export function renderCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  { config, heatmapViewModel }: ShapeViewModel,
  background: Color,
  heatmapTheme: Theme,
  heatmapSpec?: HeatmapSpec,
) {
  // eslint-disable-next-line no-empty-pattern
  const {} = config;
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
      () => {
        withContext(ctx, () => {
          // render grid
          renderMultiLine(ctx, heatmapViewModel.gridLines.x, heatmapViewModel.gridLines.stroke);
          renderMultiLine(ctx, heatmapViewModel.gridLines.y, heatmapViewModel.gridLines.stroke);
        });
      },

      () =>
        withContext(ctx, () => {
          // render cells
          const { x, y } = heatmapViewModel.gridOrigin;
          ctx.translate(x, y);
          filteredCells.forEach((cell) => {
            if (cell.visible) renderRect(ctx, cell, cell.fill, cell.stroke);
          });
        }),

      () =>
        config.cell.label.visible &&
        withContext(ctx, () => {
          // render text on cells
          const { x, y } = heatmapViewModel.gridOrigin;
          ctx.translate(x, y);
          filteredCells.forEach((cell) => {
            const fontSize = heatmapViewModel.cellFontSize(cell);
            if (cell.visible && Number.isFinite(fontSize))
              renderText(ctx, { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, cell.formatted, {
                ...config.cell.label,
                fontSize,
                align: 'center',
                baseline: 'middle',
                textColor: cell.textColor,
              });
          });
        }),

      () =>
        // render text on Y axis
        config.yAxisLabel.visible &&
        withContext(ctx, () =>
          filteredYValues.forEach((yValue) => {
            const font: Font = {
              fontFamily: config.yAxisLabel.fontFamily,
              fontStyle: config.yAxisLabel.fontStyle ? config.yAxisLabel.fontStyle : 'normal',
              fontVariant: 'normal',
              fontWeight: 'normal',
              textColor: Colors.Black.keyword,
            };
            const { padding } = config.yAxisLabel;
            const horizontalPadding =
              typeof padding === 'number' ? padding * 2 : (padding.left ?? 0) + (padding.right ?? 0);
            const [resultText] = wrapLines(
              ctx,
              yValue.text,
              font,
              config.yAxisLabel.fontSize,
              heatmapViewModel.gridOrigin.x - horizontalPadding,
              16,
              { shouldAddEllipsis: true, wrapAtWord: false },
            ).lines;
            renderText(
              ctx,
              { x: yValue.x, y: yValue.y },
              resultText,
              // the alignment for y axis labels is fixed to the right
              { ...config.yAxisLabel, align: 'right' },
            );
          }),
        ),

      () =>
        // render text on X axis
        config.xAxisLabel.visible &&
        withContext(ctx, () =>
          heatmapViewModel.xValues.forEach((xValue) =>
            renderText(ctx, { x: xValue.x, y: xValue.y }, xValue.text, config.xAxisLabel),
          ),
        ),

      () =>
        // render the xAxisTitle
        heatmapSpec?.xAxisTitle &&
        withContext(ctx, () => {
          const { width, height } = config;
          renderText(ctx, { x: width / 2, y: height - config.xAxisLabel.fontSize }, heatmapSpec.xAxisTitle!, {
            fontVariant: 'normal',
            fontWeight: 'bold',
            textColor: '#333',
            fontStyle: 'normal',
            baseline: 'middle',
            ...heatmapTheme.axes.axisTitle,
            align: 'center',
          });
        }),

      () =>
        // render the yAxisTitle
        heatmapSpec?.yAxisTitle &&
        withContext(ctx, () => {
          const { height } = config;
          renderText(
            ctx,
            { x: config.yAxisLabel.fontSize, y: height / 2 },
            heatmapSpec.yAxisTitle!,
            {
              fontVariant: 'normal',
              fontWeight: 'bold',
              textColor: '#333',
              fontStyle: 'normal',
              baseline: 'middle',
              ...heatmapTheme.axes.axisTitle,
              ...heatmapTheme.axes.axisTitle,
              align: 'center',
            },
            -90,
          );
        }),
    ]);
  });
}
