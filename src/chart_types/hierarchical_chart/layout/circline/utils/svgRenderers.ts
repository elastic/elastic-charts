import { tau } from './math';
import { Pixels } from '../types/GeometryTypes';
import {
  LinkLabelVM,
  OutsideLinksViewModel,
  RowSet,
  SectorViewModel,
  ShapeViewModel,
  TextRow,
} from '../types/ViewModelTypes';
import { addOpacity } from './calcs';

const svgNS = 'http://www.w3.org/2000/svg';

type SvgCtx = SVGSVGElement | SVGGElement;

const withContext = (ctx: SvgCtx, fun: (ctx: SvgCtx) => void) => {
  const g = document.createElementNS(svgNS, 'g');
  fun(g);
  ctx.appendChild(g);
};

const renderTextRow = (
  ctx: SvgCtx,
  { fontFamily, fontSize, fillTextColor, fillTextWeight, fontStyle, fontVariant, rotation }: RowSet,
) => (currentRow: TextRow) => {
  const crx = currentRow.rowCentroidX - (Math.cos(rotation) * currentRow.length) / 2;
  const cry = -currentRow.rowCentroidY + (Math.sin(rotation) * currentRow.length) / 2;
  withContext(ctx, (ctx) => {
    ctx.setAttribute('transform', `scale(1 -1) translate(${crx} ${cry}) rotate(${(-rotation / tau) * 360})`);
    ctx.style.font = fontStyle + ' ' + fontVariant + ' ' + fillTextWeight + ' ' + fontSize + 'px ' + fontFamily;
    ctx.style.fill = fillTextColor;
    ctx.style.stroke = 'none';
    currentRow.rowWords.forEach((box) => {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', String(box.width / 2 + box.wordBeginning));
      text.textContent = box.text;
      ctx.appendChild(text);
    });
  });
};

const renderTextRows = (ctx: SvgCtx, rowSet: RowSet) => rowSet.rows.forEach(renderTextRow(ctx, rowSet));

const renderRowSets = (ctx: SvgCtx, rowSets: RowSet[]) =>
  rowSets.forEach((rowSet: RowSet) => renderTextRows(ctx, rowSet));

const renderSectors = (ctx: SvgCtx, sectorViewModel: SectorViewModel[]) => {
  withContext(ctx, (ctx) => {
    ctx.setAttribute('transform', 'scale(1, -1)'); // D3 and Canvas2d use a left-handed coordinate system (+y = down) but the ViewModel uses +y = up, so we must locally invert Y
    sectorViewModel.forEach(({ strokeWidth, fillColor, arcPath }) => {
      const arc = document.createElementNS(svgNS, 'path');
      arc.setAttribute('stroke-width', String(strokeWidth));
      arc.setAttribute('fill', fillColor);
      arc.setAttribute('d', arcPath);
      ctx.appendChild(arc);
    });
  });
};

// order of rendering is important; determined by the order of layers in the array
// todo unify with that of canvas `renderLayers` (same code, different types)
const renderLayers = (ctx: SvgCtx, layers: Array<(ctx: SvgCtx) => void>) =>
  layers.forEach((renderLayer) => renderLayer(ctx));

const renderFillOutsideLinks = (
  ctx: SvgCtx,
  outsideLinksViewModel: OutsideLinksViewModel[],
  linkLabelTextColor: string,
  linkLabelLineWidth: Pixels,
) =>
  withContext(ctx, (ctx) => {
    ctx.style.strokeWidth = String(linkLabelLineWidth);
    ctx.style.stroke = linkLabelTextColor;
    outsideLinksViewModel.forEach(({ points }) => {
      const polyline = document.createElementNS(svgNS, 'polyline');
      polyline.setAttribute('points', points.map((p) => p.join(' ')).join(' '));
      ctx.appendChild(polyline);
    });
  });

const renderLinkLabels = (
  ctx: SvgCtx,
  linkLabelFontSize: Pixels,
  linkLabelLineWidth: Pixels,
  fontFamily: string,
  linkLabelTextColor: string,
  viewModels: LinkLabelVM[],
) =>
  withContext(ctx, (ctx) => {
    ctx.style.strokeWidth = String(linkLabelLineWidth);
    ctx.style.stroke = linkLabelTextColor;
    ctx.style.fill = 'none';
    ctx.style.font = `${linkLabelFontSize}px ${fontFamily}`;
    viewModels.forEach(({ link, translate, textAlign, text }: LinkLabelVM) => {
      const polyline = document.createElementNS(svgNS, 'polyline');
      polyline.setAttribute(
        'points',
        `${link[0][0]} ${link[0][1]} ${link
          .slice(1)
          .map((point) => point.join(' '))
          .join(' ')}`,
      );
      ctx.appendChild(polyline);

      withContext(ctx, (ctx) => {
        ctx.setAttribute('transform', `translate(${translate.join(' ')}) scale(1 -1)`);
        ctx.setAttribute(
          'text-anchor',
          { left: 'start', center: 'middle', right: 'end', start: 'start', end: 'end' }[textAlign],
        );
        ctx.style.stroke = 'none';
        ctx.style.fill = linkLabelTextColor;
        const textElem = document.createElementNS(svgNS, 'text');
        textElem.textContent = text;
        ctx.appendChild(textElem);
      });
    });
  });

export const renderShape = (
  appendRoot: SVGSVGElement,
  { config, sectorViewModel, rowSets, outsideLinksViewModel, linkLabelViewModels, diskCenter }: ShapeViewModel,
) => {
  const { sectorLineWidth, linkLabel, fontFamily } = config;

  const linkLabelTextColor = addOpacity(linkLabel.textColor, linkLabel.textOpacity);
  const ctx = appendRoot;

  while (ctx.firstChild) appendRoot.removeChild(ctx.firstChild);

  withContext(ctx, (ctx) => {
    ctx.setAttribute('transform', `translate(${diskCenter.x} ${diskCenter.y}) scale(1 -1)`);
    ctx.setAttribute('text-anchor', 'middle');
    ctx.setAttribute('dominant-baseline', 'middle');
    ctx.style.strokeLinejoin = 'round';
    ctx.style.stroke = 'white'; // todo make it configurable just like sectorLineWidth
    ctx.style.strokeWidth = String(sectorLineWidth);

    renderLayers(ctx, [
      // bottom layer: sectors (pie slices, ring sectors etc.)
      (ctx: SvgCtx) => renderSectors(ctx, sectorViewModel),

      // all the fill-based, potentially multirow text, whether inside or outside the sector
      (ctx: SvgCtx) => renderRowSets(ctx, rowSets),

      // the link lines for the outside-fill text
      (ctx: SvgCtx) => renderFillOutsideLinks(ctx, outsideLinksViewModel, linkLabelTextColor, linkLabel.lineWidth),

      // all the text and link lines for single-row outside texts
      (ctx: SvgCtx) =>
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
