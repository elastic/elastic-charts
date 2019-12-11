import { wrapToTau } from '../geometry';
import { Coordinate, Distance, Pixels, Radian, Radius, RingSector } from '../types/GeometryTypes';
import { Config } from '../types/ConfigTypes';
import { logarithm, tau, trueBearingToStandardPositionAngle } from '../utils/math';
import { RowBox, RowSet, SectorTreeNode } from '../types/ViewModelTypes';
// @ts-ignore
import parse from 'parse-color';
import { FontWeight, TextMeasure } from '../types/Types';
import { aggregateKey } from '../utils/groupByRollup';
import { conjunctiveConstraint } from '../circlineGeometry';

const ringSectorStartAngle = (d: SectorTreeNode): Radian => trueBearingToStandardPositionAngle(d.x0);

const ringSectorEndAngle = (d: SectorTreeNode): Radian => trueBearingToStandardPositionAngle(d.x1);

const ringSectorInnerRadius = (innerRadius: Radian, ringThickness: Distance) => (d: SectorTreeNode): Radius =>
  innerRadius + (d.y0unsheared as number) * ringThickness;

const ringSectorOuterRadius = (innerRadius: Radian, ringThickness: Distance) => (d: SectorTreeNode): Radius =>
  innerRadius + ((d.y0unsheared as number) + 1) * ringThickness;

const infinityRadius = 1e4; // far enough for a sub-2px precision on a 4k screen, good enough for text bounds; 64 bit floats still work well with it

const angleToCircline = (
  midRadius: Radius,
  alpha: Radian,
  direction: 1 | -1 /* 1 for clockwise and -1 for anticlockwise circline */,
) => {
  const sectorRadiusLineX = Math.cos(alpha) * midRadius;
  const sectorRadiusLineY = Math.sin(alpha) * midRadius;
  const normalAngle = alpha + (direction * Math.PI) / 2;
  const x = sectorRadiusLineX + infinityRadius * Math.cos(normalAngle);
  const y = sectorRadiusLineY + infinityRadius * Math.sin(normalAngle);
  const sectorRadiusCircline = { x, y, r: infinityRadius, inside: false, from: 0, to: tau };
  return sectorRadiusCircline;
};

// todo pick a better unique key for the slices (D3 doesn't keep track of an index)
export const nodeId = (node: SectorTreeNode): string => node.x0 + '|' + node.y0;

const ringSectorConstruction = (
  config: Config,
  innerRadius: Radius,
  ringThickness: Distance,
  ringSector: SectorTreeNode,
): RingSector => {
  const { circlePadding, radialPadding, fillOutside, radiusOutside, fillRectangleWidth, fillRectangleHeight } = config;
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
  const rectangleCirclines =
    RRx === Infinity && RRy === Infinity
      ? []
      : [
          { x: infinityRadius - RRx, y: 0, r: infinityRadius, inside: true },
          { x: -infinityRadius + RRx, y: 0, r: infinityRadius, inside: true },
          { x: 0, y: infinityRadius - RRy, r: infinityRadius, inside: true },
          { x: 0, y: -infinityRadius + RRy, r: infinityRadius, inside: true },
        ];
  return [innerCircline, outerCircline, sectorStartCircle, sectorEndCircle, ...rectangleCirclines];
};

const makeRowCircline = (
  cx: Coordinate,
  cy: Coordinate,
  radialOffset: Distance,
  rotation: Radian,
  fontSize: number,
  offsetSign: -1 | 0 | 1,
) => {
  const rowCentroidY = cy;
  const r = infinityRadius;
  const offset = (offsetSign * fontSize) / 2;
  const anotherOffset = rowCentroidY - cy + offset;
  const anotherR = r - anotherOffset;
  const x = cx + anotherR * Math.cos(-rotation + tau / 4);
  const y = cy + anotherR * Math.cos(-rotation + tau / 2);
  const circline = { r: r + radialOffset, x, y };
  return circline;
};

const getRowGeometry = (
  ringSector: RingSector,
  cx: Coordinate,
  cy: Coordinate,
  totalRowCount: number,
  linePitch: Pixels,
  rowIndex: number,
  fontSize: Pixels,
  rotation: Radian,
) => {
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
};

const rowSetComplete = (rowSet: RowSet, measuredBoxes: RowBox[]) =>
  !rowSet.rows.some((r) => isNaN(r.length)) && !measuredBoxes.length;

// todo modularize this large function
export const fillTextLayout = (
  measure: TextMeasure, // todo improve typing
  getRawText: Function, // todo improve typing
  valueFormatter: Function,
  childNodes: SectorTreeNode[],
  textFillOrigins: [number, number][],
  innerRadius: Radius,
  ringThickness: Distance,
  config: Config,
) => {
  const {
    fontFamily,
    minFontSize,
    maxFontSize,
    idealFontSizeJump,
    maxRowCount,
    fillLabel: { textColor, textInvertible, textWeight, fontStyle, fontVariant },
    horizontalTextEnforcer,
    horizontalTextAngleThreshold,
  } = config;

  const [tr, tg, tb] = parse(textColor).rgb;
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

  return childNodes.map((node, i) => {
    let rotation = trueBearingToStandardPositionAngle((node.x0 + node.x1) / 2);
    if (Math.abs(node.x1 - node.x0) > horizontalTextAngleThreshold && horizontalTextEnforcer > 0)
      rotation = rotation * (1 - horizontalTextEnforcer);
    if (tau / 4 < rotation && rotation < (3 * tau) / 4) rotation = wrapToTau(rotation - tau / 2);

    let fontSizeIndex = fontSizes.length - 1;
    const textFillOrigin = textFillOrigins[i];
    const cx = textFillOrigin[0];
    const cy = textFillOrigin[1];

    const allBoxes = getRawText(node)
      .split(' ')
      .concat(valueFormatter(node[aggregateKey]).split(' '));
    const ringSector = ringSectorConstruction(
      config,
      innerRadius + node.inRingIndex * config.shear,
      ringThickness,
      node,
    );
    let rowSet: RowSet = {
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
    let completed = false;

    while (!completed && fontSizeIndex >= 0) {
      const fontSize = fontSizes[fontSizeIndex];
      const wordSpacing = fontSize / 4;

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
        const [r, g, b] = parse(node.fill).rgb;
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
          const { maximumRowLength, rowCentroidX, rowCentroidY } = getRowGeometry(
            ringSector,
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
  });
};
