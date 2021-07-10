/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GOLDEN_RATIO } from '../../../../common/constants';
import { cssFontShorthand } from '../../../../common/text_utils';
import { clearCanvas, renderLayers, withContext } from '../../../../renderers/canvas';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { GoalSubtype } from '../../specs/constants';

// fixme turn these into config, or capitalize as constants
const referenceCircularSizeCap = 360; // goal/gauge won't be bigger even if there's ample room: it'd be a waste of space
const referenceBulletSizeCap = 500; // goal/gauge won't be bigger even if there's ample room: it'd be a waste of space
const barThicknessMinSizeRatio = 1 / 10; // bar thickness is a maximum of this fraction of the smaller graph area size
const baselineArcThickness = 32; // bar is this thick if there's ample room; no need for greater thickness even if there's a large area
const baselineBarThickness = 32; // bar is this thick if there's ample room; no need for greater thickness even if there's a large area
const marginRatio = 0.05; // same ratio on each side
const maxTickFontSize = 24;
const maxLabelFontSize = 32;
const maxCentralFontSize = 38;

function get<T>(o: { [k: string]: any }, name: string, dflt: T) {
  return name in o ? o[name] || dflt : dflt;
}

/** @internal */
export function renderCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  { config, bulletViewModel, chartCenter }: ShapeViewModel,
) {
  // eslint-disable-next-line no-empty-pattern
  const {} = config;

  const {
    subtype,
    lowestValue,
    highestValue,
    base,
    target,
    actual,
    bands,
    ticks,
    labelMajor,
    labelMinor,
    centralMajor,
    centralMinor,
  } = bulletViewModel;

  const circular = subtype === GoalSubtype.Goal;
  const vertical = subtype === GoalSubtype.VerticalBullet;

  const domain = [lowestValue, highestValue];
  const data = {
    base: { value: base },
    ...Object.fromEntries(bands.map(({ value }, index) => [`qualitative_${index}`, { value }])),
    target: { value: target },
    actual: { value: actual },
    labelMajor: { value: domain[circular || !vertical ? 0 : 1], text: labelMajor },
    labelMinor: { value: domain[circular || !vertical ? 0 : 1], text: labelMinor },
    ...Object.assign({}, ...ticks.map(({ value, text }, i) => ({ [`tick_${i}`]: { value, text } }))),
    ...(circular
      ? {
          centralMajor: { value: 0, text: centralMajor },
          centralMinor: { value: 0, text: centralMinor },
        }
      : {}),
  };

  const minSize = Math.min(config.width, config.height);

  const referenceSize =
    Math.min(
      circular ? referenceCircularSizeCap : referenceBulletSizeCap,
      circular ? minSize : vertical ? config.height : config.width,
    ) *
    (1 - 2 * marginRatio);

  const barThickness = Math.min(
    circular ? baselineArcThickness : baselineBarThickness,
    referenceSize * barThicknessMinSizeRatio,
  );

  const tickLength = barThickness * Math.pow(1 / GOLDEN_RATIO, 3);
  const tickOffset = -tickLength / 2 - barThickness / 2;
  const tickFontSize = Math.min(maxTickFontSize, referenceSize / 25);
  const labelFontSize = Math.min(maxLabelFontSize, referenceSize / 18);
  const centralFontSize = Math.min(maxCentralFontSize, referenceSize / 14);

  const shape = circular ? 'arc' : 'line';

  const geoms = [
    ...bulletViewModel.bands.map((b, i) => ({
      order: 0,
      landmarks: {
        from: i ? `qualitative_${i - 1}` : 'base',
        to: `qualitative_${i}`,
      },
      aes: { shape, fillColor: b.fillColor, lineWidth: barThickness },
    })),
    {
      order: 1,
      landmarks: { from: 'base', to: 'actual' },
      aes: { shape, fillColor: 'black', lineWidth: tickLength },
    },
    {
      order: 2,
      landmarks: { at: 'target' },
      aes: { shape, fillColor: 'black', lineWidth: barThickness / GOLDEN_RATIO },
    },
    ...bulletViewModel.ticks.map((b, i) => ({
      order: 3,
      landmarks: { at: `tick_${i}` },
      aes: { shape, fillColor: 'darkgrey', lineWidth: tickLength, axisNormalOffset: tickOffset },
    })),
    ...bulletViewModel.ticks.map((b, i) => ({
      order: 4,
      landmarks: { at: `tick_${i}` },
      aes: {
        shape: 'text',
        textAlign: vertical ? 'right' : 'center',
        textBaseline: vertical ? 'middle' : 'top',
        fillColor: 'black',
        fontShape: { fontStyle: 'normal', fontVariant: 'normal', fontWeight: '500', fontFamily: 'sans-serif' },
        axisNormalOffset: -barThickness,
      },
    })),
    {
      order: 5,
      landmarks: { at: 'labelMajor' },
      aes: {
        shape: 'text',
        axisNormalOffset: 0,
        axisTangentOffset: circular || !vertical ? 0 : 2 * labelFontSize,
        textAlign: vertical ? 'center' : 'right',
        textBaseline: 'bottom',
        fillColor: 'black',
        fontShape: { fontStyle: 'normal', fontVariant: 'normal', fontWeight: '900', fontFamily: 'sans-serif' },
      },
    },
    {
      order: 5,
      landmarks: { at: 'labelMinor' },
      aes: {
        shape: 'text',
        axisNormalOffset: 0,
        axisTangentOffset: circular || !vertical ? 0 : 2 * labelFontSize,
        textAlign: vertical ? 'center' : 'right',
        textBaseline: 'top',
        fillColor: 'black',
        fontShape: { fontStyle: 'normal', fontVariant: 'normal', fontWeight: '300', fontFamily: 'sans-serif' },
      },
    },
    ...(circular
      ? [
          {
            order: 6,
            landmarks: { at: 'centralMajor' },
            aes: {
              shape: 'text',
              textAlign: 'center',
              textBaseline: 'bottom',
              fillColor: 'black',
              fontShape: { fontStyle: 'normal', fontVariant: 'normal', fontWeight: '900', fontFamily: 'sans-serif' },
            },
          },
          {
            order: 6,
            landmarks: { at: 'centralMinor' },
            aes: {
              shape: 'text',
              textAlign: 'center',
              textBaseline: 'top',
              fillColor: 'black',
              fontShape: { fontStyle: 'normal', fontVariant: 'normal', fontWeight: '300', fontFamily: 'sans-serif' },
            },
          },
        ]
      : []),
  ];

  const maxWidth = geoms.reduce((p, g) => Math.max(p, get<number>(g.aes, 'lineWidth', 0)), 0);
  const r = 0.5 * referenceSize - maxWidth / 2;

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
    ctx.translate(chartCenter.x, chartCenter.y);
    // this applies the mathematical x/y conversion (+y is North) which is easier when developing geometry
    // functions - also, all renderers have flexibility (eg. SVG scale) and WebGL NDC is also +y up
    // - in any case, it's possible to refactor for a -y = North convention if that's deemed preferable
    ctx.scale(1, -1);

    renderLayers(ctx, [
      // clear the canvas
      (context: CanvasRenderingContext2D) => clearCanvas(context, 200000, 200000),

      (context: CanvasRenderingContext2D) =>
        withContext(context, (ctx) => {
          const fullSize = referenceSize;
          const labelSize = fullSize / 2;
          const pxRangeFrom = -fullSize / 2 + (circular || vertical ? 0 : labelSize);
          const pxRangeTo = fullSize / 2 + (!circular && vertical ? -2 * labelFontSize : 0);
          const pxRangeMid = (pxRangeFrom + pxRangeTo) / 2;
          const pxRange = pxRangeTo - pxRangeFrom;

          const domainExtent = domain[1] - domain[0];

          const linearScale = (x: number) => pxRangeFrom + (pxRange * (x - domain[0])) / domainExtent;

          const { angleStart, angleEnd } = config;
          const angleRange = angleEnd - angleStart;
          const angleScale = (x: number) => angleStart + (angleRange * (x - domain[0])) / domainExtent;
          const clockwise = angleStart > angleEnd; // todo refine this crude approach

          geoms
            .slice()
            .sort((a, b) => a.order - b.order)
            .forEach(({ landmarks, aes }) => {
              const at = get(landmarks, 'at', '');
              const from = get(landmarks, 'from', '');
              const to = get(landmarks, 'to', '');
              const textAlign = circular ? 'center' : get(aes, 'textAlign', '');
              const fontShape = get(aes, 'fontShape', '');
              const axisNormalOffset = get(aes, 'axisNormalOffset', 0);
              const axisTangentOffset = get(aes, 'axisTangentOffset', 0);
              const lineWidth = get(aes, 'lineWidth', 0);
              const strokeStyle = get(aes, 'fillColor', '');
              withContext(ctx, (ctx) => {
                ctx.beginPath();

                if (aes.shape === 'text') {
                  const { text } = data[at];
                  const label = at.slice(0, 5) === 'label';
                  const central = at.slice(0, 7) === 'central';
                  const textBaseline = label || central || !circular ? get(aes, 'textBaseline', '') : 'middle';
                  const fontSize =
                    circular && label ? labelFontSize : circular && central ? centralFontSize : tickFontSize;
                  const scaledValue = circular ? angleScale(data[at].value) : data[at] && linearScale(data[at].value);
                  // prettier-ignore
                  const x = circular
                    ? (label || central ? 0 : (r - GOLDEN_RATIO * barThickness) * Math.cos(scaledValue))
                    : (vertical ? axisNormalOffset : axisTangentOffset + scaledValue);
                  // prettier-ignore
                  const y = circular
                    ? (label ? r : central ? 0 : -(r - GOLDEN_RATIO * barThickness) * Math.sin(scaledValue))
                    : (vertical ? -axisTangentOffset - scaledValue : -axisNormalOffset);
                  const font = cssFontShorthand(fontShape, fontSize);

                  ctx.textAlign = textAlign;
                  ctx.textBaseline = textBaseline;
                  ctx.font = font;
                  ctx.scale(1, -1);
                  ctx.fillText(text, x, y);
                }

                if (aes.shape === 'arc') {
                  const cx = pxRangeMid;
                  const cy = 0;
                  const radius = at ? r + axisNormalOffset : r;
                  const startAngle = at ? angleScale(data[at].value) + Math.PI / 360 : angleScale(data[from].value);
                  const endAngle = at ? angleScale(data[at].value) - Math.PI / 360 : angleScale(data[to].value);
                  // prettier-ignore
                  const anticlockwise = at || clockwise === (data[from].value < data[to].value);

                  ctx.lineWidth = lineWidth;
                  ctx.strokeStyle = strokeStyle;
                  ctx.arc(cx, cy, radius, startAngle, endAngle, anticlockwise);
                }

                if (aes.shape === 'line') {
                  const translateX = vertical ? axisNormalOffset : axisTangentOffset;
                  const translateY = vertical ? axisTangentOffset : axisNormalOffset;
                  const atPx = data[at] && linearScale(data[at].value);
                  const fromPx = at ? atPx - 1 : linearScale(data[from].value);
                  const toPx = at ? atPx + 1 : linearScale(data[to].value);
                  const x0 = vertical ? translateX : translateX + fromPx;
                  const y0 = vertical ? translateY + fromPx : translateY;
                  const x1 = vertical ? translateX : translateX + toPx;
                  const y1 = vertical ? translateY + toPx : translateY;

                  ctx.lineWidth = lineWidth;
                  ctx.strokeStyle = strokeStyle;
                  ctx.moveTo(x0, y0);
                  ctx.lineTo(x1, y1);
                }

                ctx.stroke();
              });
            });
        }),
    ]);
  });
}
