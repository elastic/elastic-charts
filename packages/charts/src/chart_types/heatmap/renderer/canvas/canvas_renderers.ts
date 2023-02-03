/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { clearCanvas, renderLayers, withContext } from '../../../../renderers/canvas';
import { radToDeg } from '../../../../utils/common';
import { horizontalPad } from '../../../../utils/dimensions';
import { renderMultiLine } from '../../../xy_chart/renderer/canvas/primitives/line';
import { renderRect } from '../../../xy_chart/renderer/canvas/primitives/rect';
import { renderText, TextFont, wrapLines } from '../../../xy_chart/renderer/canvas/primitives/text';
import { ReactiveChartStateProps } from './connected_component';
import { getColorBandStyle, getGeometryStateStyle } from './utils';

/** @internal */
export function renderHeatmapCanvas2d(ctx: CanvasRenderingContext2D, dpr: number, props: ReactiveChartStateProps) {
  const { theme } = props.geometries;
  const { heatmapViewModels } = props.geometries;
  const {
    theme: { sharedStyle: sharedGeometryStyle },
    background,
    elementSizes,
    highlightedLegendBands,
  } = props;
  if (heatmapViewModels.length === 0) return;

  // temporary for PR wip
  const [heatmapViewModel] = heatmapViewModels;

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

    const filteredYValues = heatmapViewModel.yValues.filter((_, yIndex) => yIndex < heatmapViewModel.pageSize);

    renderLayers(ctx, [
      () => clearCanvas(ctx, background),

      () => {
        // Grid
        heatmapViewModels.forEach(({ gridOrigin: { x, y }, gridLines }) => {
          withContext(ctx, () => {
            ctx.translate(x, y);
            renderMultiLine(ctx, gridLines.x, gridLines.stroke);
            renderMultiLine(ctx, gridLines.y, gridLines.stroke);
          });
        });
      },

      () =>
        // Cells
        heatmapViewModels.forEach(({ gridOrigin: { x, y }, cells }) => {
          withContext(ctx, () => {
            ctx.translate(x, y);
            cells.forEach((cell) => {
              if (cell.visible) {
                const geometryStateStyle = getGeometryStateStyle(cell, sharedGeometryStyle, highlightedLegendBands);
                const style = getColorBandStyle(cell, geometryStateStyle);
                renderRect(ctx, cell, style.fill, style.stroke);
              }
            });
          });
        }),

      // Text on cells
      () => {
        if (!theme.cell.label.visible) return;

        heatmapViewModels.forEach(({ cellFontSize, gridOrigin: { x, y }, cells }) => {
          withContext(ctx, () => {
            ctx.translate(x, y);
            cells.forEach((cell) => {
              const fontSize = cellFontSize(cell);
              if (cell.visible && Number.isFinite(fontSize))
                renderText(ctx, { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, cell.formatted, {
                  ...theme.cell.label,
                  fontSize,
                  align: 'center',
                  baseline: 'middle',
                  textColor: cell.textColor,
                });
            });
          });
        });
      },

      // render text on Y axis
      () => {
        if (!theme.yAxisLabel.visible) return;

        heatmapViewModels.forEach(({ primaryRow, gridOrigin: { x, y } }) => {
          if (!primaryRow) return;

          withContext(ctx, () => {
            // the text is right aligned so the canvas needs to be aligned to the right of the Y axis box
            ctx.translate(x, y);
            const font: TextFont = {
              ...theme.yAxisLabel,
              baseline: 'middle' /* fixed */,
              align: 'right' /* fixed */,
            };
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
          });
        });
      },

      // render text on X axis
      () => {
        if (!theme.xAxisLabel.visible) return;

        heatmapViewModels.forEach(({ xValues, primaryColumn, gridOrigin: { x, y } }) => {
          withContext(ctx, () => {
            if (!primaryColumn) return;
            ctx.translate(x, y + elementSizes.xAxis.top);
            xValues
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
          });
        });
      },

      // render axes and panel titles
      () =>
        heatmapViewModels
          .filter(({ titles }) => titles.length > 0)
          .forEach(({ titles, gridOrigin: { x, y } }) => {
            withContext(ctx, () => {
              ctx.translate(x, y);
              titles
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
            });
          }),
    ]);
  });
}
