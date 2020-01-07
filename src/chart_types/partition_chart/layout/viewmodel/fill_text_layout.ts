import { wrapToTau } from '../geometry';
import { Coordinate, Distance, Pixels, Radian, Radius, RingSector } from '../types/geometry_types';
import { Config } from '../types/config_types';
import { logarithm, tau, trueBearingToStandardPositionAngle } from '../utils/math';
import { RowBox, RowSet, ShapeTreeNode, RowSpace, RawTextGetter } from '../types/viewmodel_types';
import { FontWeight, TextMeasure } from '../types/types';
import { aggregateKey } from '../utils/group_by_rollup';
import { conjunctiveConstraint } from '../circline_geometry';
import { Layer } from '../../specs/index';
import { stringToRGB } from '../utils/d3_utils';

function ringSectorStartAngle(d: ShapeTreeNode): Radian {
  return trueBearingToStandardPositionAngle(d.x0 + Math.max(0, d.x1 - d.x0 - tau / 2) / 2);
}

function ringSectorEndAngle(d: ShapeTreeNode): Radian {
  return trueBearingToStandardPositionAngle(d.x1 - Math.max(0, d.x1 - d.x0 - tau / 2) / 2);
}

function ringSectorInnerRadius(innerRadius: Radian, ringThickness: Distance) {
  return (d: ShapeTreeNode): Radius => innerRadius + (d.y0 as number) * ringThickness;
}
function ringSectorOuterRadius(innerRadius: Radian, ringThickness: Distance) {
  return (d: ShapeTreeNode): Radius => innerRadius + ((d.y0 as number) + 1) * ringThickness;
}

const infinityRadius = 1e4; // far enough for a sub-2px precision on a 4k screen, good enough for text bounds; 64 bit floats still work well with it

function angleToCircline(
  midRadius: Radius,
  alpha: Radian,
  direction: 1 | -1 /* 1 for clockwise and -1 for anticlockwise circline */,
) {
  const sectorRadiusLineX = Math.cos(alpha) * midRadius;
  const sectorRadiusLineY = Math.sin(alpha) * midRadius;
  const normalAngle = alpha + (direction * Math.PI) / 2;
  const x = sectorRadiusLineX + infinityRadius * Math.cos(normalAngle);
  const y = sectorRadiusLineY + infinityRadius * Math.sin(normalAngle);
  const sectorRadiusCircline = { x, y, r: infinityRadius, inside: false, from: 0, to: tau };
  return sectorRadiusCircline;
}

// todo pick a better unique key for the slices (D3 doesn't keep track of an index)
export function nodeId(node: ShapeTreeNode): string {
  return node.x0 + '|' + node.y0;
}

export function rectangleConstruction(node: ShapeTreeNode) {
  return {
    x0: node.x0,
    y0: node.y0px,
    x1: node.x1,
    y1: node.y1px,
  };
}

export function ringSectorConstruction(config: Config, innerRadius: Radius, ringThickness: Distance) {
  return (ringSector: ShapeTreeNode): RingSector => {
    const {
      circlePadding,
      radialPadding,
      fillOutside,
      radiusOutside,
      fillRectangleWidth,
      fillRectangleHeight,
    } = config;
    const r =
      (fillOutside ? ringSectorOuterRadius : ringSectorInnerRadius)(innerRadius, ringThickness)(ringSector) +
      circlePadding * 2;
    const R = Math.max(
      r,
      ringSectorOuterRadius(innerRadius, ringThickness)(ringSector) - circlePadding + (fillOutside ? radiusOutside : 0),
    );
    const alpha = ringSectorStartAngle(ringSector);
    const beta = ringSectorEndAngle(ringSector);
    const innerCircline = { x: 0, y: 0, r: r, inside: true, from: 0, to: tau };
    const outerCircline = { x: 0, y: 0, r: R, inside: false, from: 0, to: tau };
    const midRadius = (r + R) / 2;
    const sectorStartCircle = angleToCircline(midRadius, alpha - radialPadding, -1);
    const sectorEndCircle = angleToCircline(midRadius, beta + radialPadding, 1);
    const RRx = fillRectangleWidth / 2;
    const RRy = fillRectangleHeight / 2;
    const fullCircle = ringSector.x0 === 0 && ringSector.x1 === tau;
    const sectorCirclines = [
      ...(fullCircle && innerRadius === 0 ? [] : [innerCircline]),
      outerCircline,
      ...(fullCircle ? [] : [sectorStartCircle, sectorEndCircle]),
    ];
    const rectangleCirclines =
      RRx === Infinity && RRy === Infinity
        ? []
        : [
            { x: infinityRadius - RRx, y: 0, r: infinityRadius, inside: true },
            { x: -infinityRadius + RRx, y: 0, r: infinityRadius, inside: true },
            { x: 0, y: infinityRadius - RRy, r: infinityRadius, inside: true },
            { x: 0, y: -infinityRadius + RRy, r: infinityRadius, inside: true },
          ];
    return [...sectorCirclines, ...rectangleCirclines];
  };
}

function makeRowCircline(
  cx: Coordinate,
  cy: Coordinate,
  radialOffset: Distance,
  rotation: Radian,
  fontSize: number,
  offsetSign: -1 | 0 | 1,
) {
  const rowCentroidY = cy;
  const r = infinityRadius;
  const offset = (offsetSign * fontSize) / 2;
  const anotherOffset = rowCentroidY - cy + offset;
  const anotherR = r - anotherOffset;
  const x = cx + anotherR * Math.cos(-rotation + tau / 4);
  const y = cy + anotherR * Math.cos(-rotation + tau / 2);
  const circline = { r: r + radialOffset, x, y };
  return circline;
}

export function getSectorRowGeometry(
  ringSector: RingSector,
  cx: Coordinate,
  cy: Coordinate,
  totalRowCount: number,
  linePitch: Pixels,
  rowIndex: number,
  fontSize: Pixels,
  rotation: Radian,
): RowSpace {
  // prettier-ignore
  const offset =
      (totalRowCount / 2) * fontSize
    + fontSize / 2
    - linePitch * rowIndex

  const topCircline = makeRowCircline(cx, cy, offset, rotation, fontSize, 1);
  const bottomCircline = makeRowCircline(cx, cy, offset, rotation, fontSize, -1);
  const midCircline = makeRowCircline(cx, cy, offset, rotation, 0, 0);

  const valid1 = conjunctiveConstraint(ringSector, Object.assign({}, topCircline, { from: 0, to: tau }))[0];
  if (!valid1) return { rowCentroidX: cx, rowCentroidY: cy, maximumRowLength: 0 };
  const valid2 = conjunctiveConstraint(ringSector, Object.assign({}, bottomCircline, { from: 0, to: tau }))[0];
  if (!valid2) return { rowCentroidX: cx, rowCentroidY: cy, maximumRowLength: 0 };
  const from = Math.max(valid1.from, valid2.from);
  const to = Math.min(valid1.to, valid2.to);
  const midAngle = (from + to) / 2;
  const cheapTangent = Math.max(0, to - from); /* Math.tan(Math.max(0, to - from)) */ // https://en.wikipedia.org/wiki/Small-angle_approximation
  const rowCentroidX = midCircline.r * Math.cos(midAngle) + midCircline.x;
  const rowCentroidY = midCircline.r * Math.sin(midAngle) + midCircline.y;
  const maximumRowLength = cheapTangent * infinityRadius;
  return { rowCentroidX, rowCentroidY, maximumRowLength };
}

export function getRectangleRowGeometry(
  container: any,
  cx: number,
  cy: number,
  totalRowCount: number,
  linePitch: Pixels,
  rowIndex: number,
  fontSize: Pixels,
): RowSpace {
  const wordSpacing = getWordSpacing(fontSize);
  const x0 = container.x0 + wordSpacing;
  const y0 = container.y0 + linePitch / 2;
  const x1 = container.x1 - wordSpacing;
  const y1 = container.y1 - linePitch / 2;

  // prettier-ignore
  const offset =
      (totalRowCount / 2) * fontSize
    + fontSize / 2
    - linePitch * rowIndex

  const rowCentroidX = cx;
  const rowCentroidY = cy - offset;
  return {
    rowCentroidX,
    rowCentroidY: -rowCentroidY,
    maximumRowLength: rowCentroidY - linePitch / 2 < y0 || rowCentroidY + linePitch / 2 > y1 ? 0 : x1 - x0,
  };
}

function rowSetComplete(rowSet: RowSet, measuredBoxes: RowBox[]) {
  return !rowSet.rows.some((r) => isNaN(r.length)) && !measuredBoxes.length;
}

function identityRowSet(): RowSet {
  return {
    id: '',
    rows: [],
    fontFamily: '',
    fontStyle: '',
    fontVariant: '',
    fontSize: NaN,
    fillTextColor: '',
    fillTextWeight: 400,
    rotation: NaN,
  };
}

function getAllBoxes(
  rawTextGetter: RawTextGetter,
  valueFormatter: (value: number) => string,
  node: ShapeTreeNode,
): string[] {
  return rawTextGetter(node)
    .split(' ')
    .concat(valueFormatter(node[aggregateKey]).split(' '));
}

function getWordSpacing(fontSize: number) {
  return fontSize / 4;
}

function fill(
  config: Config,
  layers: Layer[],
  fontSizes: string | any[],
  measure: { (font: string, texts: string[]): TextMetrics[]; (arg0: string, arg1: any): any },
  rawTextGetter: RawTextGetter,
  valueFormatter: (value: number) => string,
  textFillOrigins: any[],
  shapeConstructor: (n: ShapeTreeNode) => any,
  getShapeRowGeometry: (...args: any[]) => RowSpace,
  getRotation: Function,
) {
  return (node: ShapeTreeNode, index: number, a: ShapeTreeNode[]) => {
    const { maxRowCount, fillLabel } = config;

    const {
      textColor,
      textInvertible,
      textWeight,
      fontStyle,
      fontVariant,
      fontFamily,
      formatter,
      fillColor,
    } = Object.assign(
      { fontFamily: config.fontFamily, formatter: valueFormatter, fillColor: node.fill },
      fillLabel,
      layers[node.depth - 1] && layers[node.depth - 1].fillLabel,
      layers[node.depth - 1] && layers[node.depth - 1].shape,
    );

    const shapeFillColor = typeof fillColor === 'function' ? fillColor(node, index, a) : fillColor;
    const { r: tr, g: tg, b: tb } = stringToRGB(textColor);
    let fontSizeIndex = fontSizes.length - 1;
    const allBoxes = getAllBoxes(rawTextGetter, formatter, node);
    let rowSet = identityRowSet();
    let completed = false;
    const rotation = getRotation(node);
    const container = shapeConstructor(node);
    const [cx, cy] = textFillOrigins[index];

    while (!completed && fontSizeIndex >= 0) {
      const fontSize = fontSizes[fontSizeIndex];
      const wordSpacing = getWordSpacing(fontSize);

      // model text pieces, obtaining their width at the current font size
      const measurements = measure(fontSize + 'px ' + fontFamily, allBoxes);
      const allMeasuredBoxes: RowBox[] = measurements.map(
        ({ width, emHeightDescent, emHeightAscent }: TextMetrics, i: number) => ({
          width,
          verticalOffset: -(emHeightDescent + emHeightAscent) / 2, // meaning, `middle`,
          text: allBoxes[i],
          wordBeginning: NaN,
        }),
      );
      const linePitch = fontSize;

      // rowSet building starts
      let targetRowCount = 0;
      let measuredBoxes = allMeasuredBoxes.slice();
      let innerCompleted = false;

      while (++targetRowCount <= maxRowCount && !innerCompleted) {
        measuredBoxes = allMeasuredBoxes.slice();
        const { r, g, b } = stringToRGB(shapeFillColor);
        const inverseForContrast = textInvertible && r * 0.299 + g * 0.587 + b * 0.114 < 150;
        rowSet = {
          id: nodeId(node),
          fontSize,
          fontFamily,
          fontStyle,
          fontVariant,
          // fontWeight must be a multiple of 100 for non-variable width fonts, otherwise weird things happen due to
          // https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight#Fallback_weights - Fallback weights
          // todo factor out the discretization into a => FontWeight function
          fillTextWeight: (Math.round(textWeight / 100) * 100) as FontWeight,
          fillTextColor: inverseForContrast ? `rgb(${255 - tr}, ${255 - tg}, ${255 - tb})` : textColor,
          rotation,
          rows: [...Array(targetRowCount)].map(() => ({
            rowWords: [],
            rowCentroidX: NaN,
            rowCentroidY: NaN,
            maximumLength: NaN,
            length: NaN,
          })),
        };

        let currentRowIndex = 0;
        while (currentRowIndex < targetRowCount) {
          const currentRow = rowSet.rows[currentRowIndex];
          const currentRowWords = currentRow.rowWords;

          // current row geometries
          const { maximumRowLength, rowCentroidX, rowCentroidY } = getShapeRowGeometry(
            container,
            cx,
            cy,
            targetRowCount,
            linePitch,
            currentRowIndex,
            fontSize,
            rotation,
          );

          currentRow.rowCentroidX = rowCentroidX;
          currentRow.rowCentroidY = rowCentroidY;
          currentRow.maximumLength = maximumRowLength;

          // row building starts
          let currentRowLength = 0;
          let rowHasRoom = true;

          // keep adding words while there's room
          while (measuredBoxes.length && rowHasRoom) {
            // adding box to row
            const currentBox = measuredBoxes[0];

            const wordBeginning = currentRowLength;
            currentRowLength += currentBox.width + wordSpacing;

            if (currentRowLength <= currentRow.maximumLength) {
              currentRowWords.push(Object.assign({}, currentBox, { wordBeginning }));
              currentRow.length = currentRowLength;
              measuredBoxes.shift();
            } else {
              rowHasRoom = false;
            }
          }

          currentRowIndex++;
        }

        innerCompleted = rowSetComplete(rowSet, measuredBoxes);
      }
      {
        // row building conditions
        completed = !measuredBoxes.length;
        if (!completed) {
          fontSizeIndex -= 1;
        }
      }
    }
    rowSet.rows = rowSet.rows.filter((r) => !isNaN(r.length));
    return rowSet;
  };
}

export function inSectorRotation(horizontalTextEnforcer: number, horizontalTextAngleThreshold: number) {
  return (node: ShapeTreeNode) => {
    let rotation = trueBearingToStandardPositionAngle((node.x0 + node.x1) / 2);
    if (Math.abs(node.x1 - node.x0) > horizontalTextAngleThreshold && horizontalTextEnforcer > 0)
      rotation = rotation * (1 - horizontalTextEnforcer);
    if (tau / 4 < rotation && rotation < (3 * tau) / 4) rotation = wrapToTau(rotation - tau / 2);
    return rotation;
  };
}

export function fillTextLayout(
  measure: TextMeasure,
  rawTextGetter: RawTextGetter,
  valueFormatter: (value: number) => string,
  childNodes: ShapeTreeNode[],
  config: Config,
  layers: Layer[],
  textFillOrigins: [number, number][],
  shapeConstructor: (n: ShapeTreeNode) => any,
  getShapeRowGeometry: (...args: any[]) => RowSpace,
  getRotation: Function,
) {
  const { minFontSize, maxFontSize, idealFontSizeJump } = config;
  const fontSizeMagnification = maxFontSize / minFontSize;
  const fontSizeJumpCount = Math.round(logarithm(idealFontSizeJump, fontSizeMagnification));
  const realFontSizeJump = Math.pow(fontSizeMagnification, 1 / fontSizeJumpCount);
  const fontSizes: Pixels[] = [];
  for (let i = 0; i <= fontSizeJumpCount; i++) {
    const fontSize = Math.round(minFontSize * Math.pow(realFontSizeJump, i));
    if (fontSizes.indexOf(fontSize) === -1) {
      fontSizes.push(fontSize);
    }
  }

  return childNodes.map(
    fill(
      config,
      layers,
      fontSizes,
      measure,
      rawTextGetter,
      valueFormatter,
      textFillOrigins,
      shapeConstructor,
      getShapeRowGeometry,
      getRotation,
    ),
  );
}
