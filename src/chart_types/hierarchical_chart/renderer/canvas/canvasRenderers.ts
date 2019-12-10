import { Coordinate, Pixels } from '../../layout/circline/types/GeometryTypes';
import { addOpacity } from '../../layout/circline/utils/calcs';
import {
  LinkLabelVM,
  OutsideLinksViewModel,
  RowSet,
  SectorViewModel,
  ShapeViewModel,
  TextRow,
} from '../../layout/circline/types/ViewModelTypes';

// withContext abstracts out the otherwise error-prone save/restore pairing; it can be nested and/or put into sequence
// The idea is that you just set what's needed for the enclosed snippet, which may temporarily override values in the
// outer withContext. Example: we use a +y = top convention, so when doing text rendering, y has to be flipped (ctx.scale)
// otherwise the text will render upside down.
const withContext = (ctx: CanvasRenderingContext2D, fun: (ctx: CanvasRenderingContext2D) => void) => {
  ctx.save();
  fun(ctx);
  ctx.restore();
};

const clearCanvas = (ctx: CanvasRenderingContext2D, width: Coordinate, height: Coordinate, backgroundColor: string) =>
  withContext(ctx, (ctx) => {
    // two steps, as the backgroundColor may have a non-one opacity
    // todo we should avoid `fillRect` by setting the <canvas> element background via CSS
    ctx.clearRect(-width, -height, 2 * width, 2 * height); // remove past contents
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(-width, -height, 2 * width, 2 * height); // new background
  });

const renderTextRow = (
  ctx: CanvasRenderingContext2D,
  { fontFamily, fontSize, fillTextColor, fillTextWeight, fontStyle, fontVariant, rotation }: RowSet,
) => (currentRow: TextRow) => {
  const crx = currentRow.rowCentroidX - (Math.cos(rotation) * currentRow.length) / 2;
  const cry = -currentRow.rowCentroidY + (Math.sin(rotation) * currentRow.length) / 2;
  withContext(ctx, (ctx) => {
    ctx.scale(1, -1);
    ctx.translate(crx, cry);
    ctx.rotate(-rotation);
    ctx.font = fontStyle + ' ' + fontVariant + ' ' + fillTextWeight + ' ' + fontSize + 'px ' + fontFamily;
    ctx.fillStyle = fillTextColor;
    currentRow.rowWords.forEach((box) => ctx.fillText(box.text, box.width / 2 + box.wordBeginning, 0));
  });
};

const renderTextRows = (ctx: CanvasRenderingContext2D, rowSet: RowSet) =>
  rowSet.rows.forEach(renderTextRow(ctx, rowSet));

const renderRowSets = (ctx: CanvasRenderingContext2D, rowSets: RowSet[]) =>
  rowSets.forEach((rowSet: RowSet) => renderTextRows(ctx, rowSet));

export const lineWidthMult = /*0.15 || */ 12;

const renderSectors = (ctx: CanvasRenderingContext2D, sectorViewModel: SectorViewModel[]) => {
  withContext(ctx, (ctx) => {
    ctx.scale(1, -1); // D3 and Canvas2d use a left-handed coordinate system (+y = down) but the ViewModel uses +y = up, so we must locally invert Y
    sectorViewModel.forEach(({ strokeWidth, fillColor, arcPath }) => {
      const path = new Path2D(arcPath);
      ctx.fillStyle = fillColor;
      ctx.fill(path);
      if (strokeWidth > 0.001) {
        // Canvas2d stroke ignores an exact zero line width
        ctx.lineWidth = strokeWidth;
        ctx.stroke(path);
      }
    });
  });
};

// order of rendering is important; determined by the order of layers in the array
// todo unify with that of svg `renderLayers` (same code, different types)
const renderLayers = (ctx: CanvasRenderingContext2D, layers: Array<(ctx: CanvasRenderingContext2D) => void>) =>
  layers.forEach((renderLayer) => renderLayer(ctx));

const renderFillOutsideLinks = (
  ctx: CanvasRenderingContext2D,
  outsideLinksViewModel: OutsideLinksViewModel[],
  linkLabelTextColor: string,
  linkLabelLineWidth: Pixels,
) =>
  withContext(ctx, (ctx) => {
    ctx.lineWidth = linkLabelLineWidth;
    ctx.strokeStyle = linkLabelTextColor;
    outsideLinksViewModel.forEach(({ points }) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.stroke();
    });
  });

const renderLinkLabels = (
  ctx: CanvasRenderingContext2D,
  linkLabelFontSize: Pixels,
  linkLabelLineWidth: Pixels,
  fontFamily: string,
  linkLabelTextColor: string,
  viewModels: LinkLabelVM[],
) =>
  withContext(ctx, (ctx) => {
    ctx.lineWidth = linkLabelLineWidth;
    ctx.strokeStyle = linkLabelTextColor;
    ctx.fillStyle = linkLabelTextColor;
    ctx.font = `${400} ${linkLabelFontSize}px ${fontFamily}`;
    viewModels.forEach(({ link, translate, textAlign, text }: LinkLabelVM) => {
      ctx.beginPath();
      ctx.moveTo(...link[0]);
      link.slice(1).forEach((point) => ctx.lineTo(...point));
      ctx.stroke();
      withContext(ctx, (ctx) => {
        ctx.translate(...translate);
        ctx.scale(1, -1); // flip for text rendering not to be upside down
        ctx.textAlign = textAlign;
        ctx.fillText(text, 0, 0);
      });
    });
  });

export const renderSunburstCanvas2d = (
  ctx: CanvasRenderingContext2D,
  dpr: number,
  { config, sectorViewModel, rowSets, outsideLinksViewModel, linkLabelViewModels, diskCenter }: ShapeViewModel,
) => {
  const { sectorLineWidth, linkLabel, fontFamily, backgroundColor } = config;

  const linkLabelTextColor = addOpacity(linkLabel.textColor, linkLabel.textOpacity);

  withContext(ctx, (ctx) => {
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
    ctx.translate(diskCenter.x, diskCenter.y);
    // this applies the mathematical x/y conversion (+y is North) which is easier when developing geometry
    // functions - also, all renderers have flexibility (eg. SVG scale) and WebGL NDC is also +y up
    // - in any case, it's possible to refactor for a -y = North convention if that's deemed preferable
    ctx.scale(1, -1);

    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white'; // todo make it configurable just like sectorLineWidth
    ctx.lineWidth = sectorLineWidth;

    // painter's algorithm, like that of SVG: the sequence determines what overdraws what; first element of the array is drawn first
    // (of course, with SVG, it's for ambiguous situations only, eg. when 3D transforms with different Z values aren't used, but
    // unlike SVG and esp. WebGL, Canvas2d doesn't support the 3rd dimension well, see ctx.transform / ctx.setTransform).
    // The layers are callbacks, because of the need to not bake in the `ctx`, it feels more composable and uncoupled this way.
    renderLayers(ctx, [
      // clear the canvas
      (ctx: CanvasRenderingContext2D) => clearCanvas(ctx, 200000, 200000, backgroundColor),

      // bottom layer: sectors (pie slices, ring sectors etc.)
      (ctx: CanvasRenderingContext2D) => renderSectors(ctx, sectorViewModel),

      // all the fill-based, potentially multirow text, whether inside or outside the sector
      (ctx: CanvasRenderingContext2D) => renderRowSets(ctx, rowSets),

      // the link lines for the outside-fill text
      (ctx: CanvasRenderingContext2D) =>
        renderFillOutsideLinks(ctx, outsideLinksViewModel, linkLabelTextColor, linkLabel.lineWidth),

      // all the text and link lines for single-row outside texts
      (ctx: CanvasRenderingContext2D) =>
        renderLinkLabels(
          ctx,
          linkLabel.fontSize,
          linkLabel.lineWidth,
          fontFamily,
          linkLabelTextColor,
          linkLabelViewModels,
        ),
    ]);
  });
};
