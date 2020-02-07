import { withContext, renderLayers, clearCanvas } from '../../../../renderers/canvas';
import { renderBars } from './bars';
import { renderAreas } from './areas';
import { renderLines } from './lines';
import { renderAxes } from './axes';
import { renderGrids } from './grids';
import { ReactiveChartStateProps } from './xy_chart';
import { renderAnnotations } from './annotations';
import { renderBarValues } from './values/bar';
import { renderDebugRect } from './utils/debug';
import { stringToRGB } from '../../../partition_chart/layout/utils/d3_utils';
import { Rect } from '../../../../geoms/types';

export function renderXYChartCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  clippings: Rect,
  props: ReactiveChartStateProps,
) {
  // debugger;
  withContext(ctx, (ctx) => {
    // set some defaults for the overall rendering

    // let's set the devicePixelRatio once and for all; then we'll never worry about it again
    ctx.scale(dpr, dpr);

    // all texts are currently center-aligned because
    //     - the calculations manually compute and lay out text (word) boxes, so we can choose whatever
    //     - but center/middle has mathematical simplicity and the most unassuming thing
    //     - due to using the math x/y convention (+y is up) while Canvas uses screen convention (+y is down)
    //         text rendering must be y-flipped, which is a bit easier this way

    // this applies the mathematical x/y conversion (+y is North) which is easier when developing geometry
    // functions - also, all renderers have flexibility (eg. SVG scale) and WebGL NDC is also +y up
    // - in any case, it's possible to refactor for a -y = North convention if that's deemed preferable
    // ctx.scale(1, -1);

    const {
      chartDimensions,
      chartTransform,
      chartRotation,
      geometries,
      theme,
      highlightedLegendItem,
      annotationDimensions,
      annotationSpecs,
      axisTickPositions,
      axesSpecs,
      axesTicksDimensions,
      axesGridLinesPositions,
      debug,
    } = props;
    const transform = {
      x: chartDimensions.left + chartTransform.x,
      y: chartDimensions.top + chartTransform.y,
    };
    // painter's algorithm, like that of SVG: the sequence determines what overdraws what; first element of the array is drawn first
    // (of course, with SVG, it's for ambiguous situations only, eg. when 3D transforms with different Z values aren't used, but
    // unlike SVG and esp. WebGL, Canvas2d doesn't support the 3rd dimension well, see ctx.transform / ctx.setTransform).
    // The layers are callbacks, because of the need to not bake in the `ctx`, it feels more composable and uncoupled this way.
    renderLayers(ctx, [
      // clear the canvas
      (ctx: CanvasRenderingContext2D) => clearCanvas(ctx, 200000, 200000 /*, backgroundColor*/),

      (ctx: CanvasRenderingContext2D) => {
        renderAxes(ctx, {
          axesPositions: axisTickPositions.axisPositions,
          axesSpecs,
          axesTicksDimensions,
          axesVisibleTicks: axisTickPositions.axisVisibleTicks,
          chartDimensions,
          debug,
          axisStyle: theme.axes,
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        renderGrids(ctx, {
          axesSpecs,
          chartDimensions,
          axesGridLinesPositions,
          chartTheme: theme,
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          ctx.translate(transform.x, transform.y);
          ctx.rotate((chartRotation * Math.PI) / 180);
          renderAnnotations(
            ctx,
            {
              annotationDimensions,
              annotationSpecs,
            },
            true,
          );
        });
      },

      // bottom layer: sectors (pie slices, ring sectors etc.)
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          ctx.translate(transform.x, transform.y);
          ctx.rotate((chartRotation * Math.PI) / 180);
          renderBars(ctx, geometries.bars, theme.sharedStyle, clippings, highlightedLegendItem);
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          ctx.translate(transform.x, transform.y);
          ctx.rotate((chartRotation * Math.PI) / 180);
          renderAreas(ctx, {
            areas: geometries.areas,
            clippings,
            highlightedLegendItem: highlightedLegendItem || null,
            sharedStyle: theme.sharedStyle,
          });
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          ctx.translate(transform.x, transform.y);
          ctx.rotate((chartRotation * Math.PI) / 180);
          renderLines(ctx, {
            lines: geometries.lines,
            clippings,
            highlightedLegendItem: highlightedLegendItem || null,
            sharedStyle: theme.sharedStyle,
          });
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          ctx.translate(transform.x, transform.y);
          ctx.rotate((chartRotation * Math.PI) / 180);
          renderBarValues(ctx, {
            bars: geometries.bars,
            chartDimensions,
            chartRotation,
            debug,
            theme,
          });
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          ctx.translate(transform.x, transform.y);
          ctx.rotate((chartRotation * Math.PI) / 180);
          renderAnnotations(
            ctx,
            {
              annotationDimensions,
              annotationSpecs,
            },
            false,
          );
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        if (!debug) {
          return;
        }
        withContext(ctx, (ctx) => {
          renderDebugRect(
            ctx,
            {
              x: chartDimensions.left,
              y: chartDimensions.top,
              width: chartDimensions.width,
              height: chartDimensions.height,
            },
            {
              color: stringToRGB('transparent'),
            },
            {
              color: stringToRGB('red'),
              width: 4,
              dash: [4, 4],
            },
          );
        });
      },
    ]);
  });
}
