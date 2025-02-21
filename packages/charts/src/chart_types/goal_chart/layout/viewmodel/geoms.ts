/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSagitta, getMinSagitta, getTransformDirection } from './utils';
import { GOLDEN_RATIO, TAU } from '../../../../common/constants';
import type { PointObject, Radian, Rectangle } from '../../../../common/geometry';
import type { Font } from '../../../../common/text_utils';
import { cssFontShorthand } from '../../../../common/text_utils';
import type { CanvasRenderer } from '../../../../renderers/canvas';
import { measureText } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import type { Dimensions } from '../../../../utils/dimensions';
import type { Theme } from '../../../../utils/themes/theme';
import { GoalSubtype } from '../../specs/constants';
import type { BulletViewModel } from '../types/viewmodel_types';

/** @internal */
export interface Mark {
  boundingBoxes: (ctx: CanvasRenderingContext2D) => Rectangle[];
  render: CanvasRenderer;
}

/** @internal */
export class Section implements Mark {
  protected readonly x: number;
  protected readonly y: number;
  protected readonly xTo: number;
  protected readonly yTo: number;
  protected readonly lineWidth: number;
  protected readonly strokeStyle: string;
  protected readonly capturePad: number;

  constructor(
    x: number,
    y: number,
    xTo: number,
    yTo: number,
    lineWidth: number,
    strokeStyle: string,
    capturePad: number,
  ) {
    this.x = x;
    this.y = y;
    this.xTo = xTo;
    this.yTo = yTo;
    this.lineWidth = lineWidth;
    this.strokeStyle = strokeStyle;
    this.capturePad = capturePad;
  }

  boundingBoxes() {
    // modifying with half the line width is a simple yet imprecise method for ensuring that the
    // entire ink is in the bounding box; depending on orientation and line ending, the bounding
    // box may overstate the data ink bounding box, which is preferable to understating it
    return this.lineWidth === 0
      ? []
      : [
          {
            x0: Math.min(this.x, this.xTo) - this.lineWidth / 2 - this.capturePad,
            y0: Math.min(this.y, this.yTo) - this.lineWidth / 2 - this.capturePad,
            x1: Math.max(this.x, this.xTo) + this.lineWidth / 2 + this.capturePad,
            y1: Math.max(this.y, this.yTo) + this.lineWidth / 2 + this.capturePad,
          },
        ];
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.strokeStyle;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.xTo, this.yTo);
    ctx.stroke();
  }
}

/** @internal */
export const initialBoundingBox = (): Rectangle => ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });

/** @internal */
export class Arc implements Mark {
  protected readonly x: number;
  protected readonly y: number;
  protected readonly radius: number;
  protected readonly startAngle: Radian;
  protected readonly endAngle: Radian;
  protected readonly anticlockwise: boolean;
  protected readonly lineWidth: number;
  protected readonly strokeStyle: string;
  protected readonly arcBoxSamplePitch: number;
  protected readonly capturePad: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise: boolean,
    lineWidth: number,
    strokeStyle: string,
    capturePad: number,
    arcBoxSamplePitch: number,
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.anticlockwise = anticlockwise;
    this.lineWidth = lineWidth;
    this.strokeStyle = strokeStyle;
    this.capturePad = capturePad;
    this.arcBoxSamplePitch = arcBoxSamplePitch;
  }

  boundingBoxes() {
    if (this.lineWidth === 0) return [];

    const box = initialBoundingBox();

    // instead of an analytical solution, we approximate with a GC-free grid sampler

    // full circle rotations such that `startAngle' and `endAngle` are positive
    const rotationCount = Math.ceil(Math.max(0, -this.startAngle, -this.endAngle) / TAU);
    const startAngle = this.startAngle + rotationCount * TAU;
    const endAngle = this.endAngle + rotationCount * TAU;

    // snapping to the closest `arcBoxSamplePitch` increment
    const angleFrom: Radian = Math.round(startAngle / this.arcBoxSamplePitch) * this.arcBoxSamplePitch;
    const angleTo: Radian = Math.round(endAngle / this.arcBoxSamplePitch) * this.arcBoxSamplePitch;
    const signedIncrement = this.arcBoxSamplePitch * Math.sign(angleTo - angleFrom);

    for (let angle: Radian = angleFrom; angle <= angleTo; angle += signedIncrement) {
      // unit vector for the angle direction
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      const innerRadius = this.radius - this.lineWidth / 2;
      const outerRadius = this.radius + this.lineWidth / 2;

      // inner point of the sector
      const innerX = this.x + vx * innerRadius;
      const innerY = this.y + vy * innerRadius;

      // outer point of the sector
      const outerX = this.x + vx * outerRadius;
      const outerY = this.y + vy * outerRadius;

      box.x0 = Math.min(box.x0, innerX - this.capturePad, outerX - this.capturePad);
      box.y0 = Math.min(box.y0, innerY - this.capturePad, outerY - this.capturePad);
      box.x1 = Math.max(box.x1, innerX + this.capturePad, outerX + this.capturePad);
      box.y1 = Math.max(box.y1, innerY + this.capturePad, outerY + this.capturePad);

      if (signedIncrement === 0) break; // happens if fromAngle === toAngle
    }

    return Number.isFinite(box.x0) ? [box] : [];
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.strokeStyle;
    ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
    ctx.stroke();
  }
}

/** @internal */
export class Text implements Mark {
  protected readonly x: number;
  protected readonly y: number;
  protected readonly text: string;
  protected readonly textAlign: CanvasTextAlign;
  protected readonly textBaseline: CanvasTextBaseline;
  protected readonly fontShape: Font;
  protected readonly fontSize: number;
  protected readonly fillStyle: string;
  protected readonly capturePad: number;

  constructor(
    x: number,
    y: number,
    text: string,
    textAlign: CanvasTextAlign,
    textBaseline: CanvasTextBaseline,
    fontShape: Font,
    fontSize: number,
    fillStyle: string,
    capturePad: number,
  ) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.textAlign = textAlign;
    this.textBaseline = textBaseline;
    this.fontShape = fontShape;
    this.fontSize = fontSize;
    this.fillStyle = fillStyle;
    this.capturePad = capturePad;
  }

  setCanvasTextState(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    ctx.font = cssFontShorthand(this.fontShape, this.fontSize);
  }

  boundingBoxes(ctx: CanvasRenderingContext2D) {
    if (this.text.length === 0) return [];
    const box = measureText(ctx)(this.text, this.fontShape, this.fontSize);
    return [
      {
        x0: -box.width / 2 + this.x - this.capturePad,
        y0: -box.height / 2 + this.y - this.capturePad,
        x1: box.width / 2 + this.x + this.capturePad,
        y1: box.height / 2 + this.y + this.capturePad,
      },
    ];
  }

  render(ctx: CanvasRenderingContext2D) {
    this.setCanvasTextState(ctx);
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.fillText(this.text, this.x, this.y);
  }
}

function get<T>(o: { [k: string]: any }, name: string, dflt: T) {
  return name in o ? o[name] || dflt : dflt;
}

/** @internal */
export function geoms(
  bulletViewModel: BulletViewModel,
  theme: Theme['goal'],
  parentDimensions: Dimensions,
  chartCenter: PointObject,
): Mark[] {
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
    angleEnd,
    angleStart,
  } = bulletViewModel;

  const circular = subtype === GoalSubtype.Goal;
  const vertical = subtype === GoalSubtype.VerticalBullet;

  const domain: [number, number] = [lowestValue, highestValue];
  const data = {
    base: { value: base },
    ...Object.fromEntries(bands.map(({ value }, index) => [`qualitative_${index}`, { value }])),
    target: { value: target },
    actual: { value: actual },
    yOffset: { value: 0 },
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

  const minSize = Math.min(parentDimensions.width, parentDimensions.height);

  const referenceSize =
    Math.min(
      circular ? theme.maxCircularSize : theme.maxBulletSize,
      circular ? minSize : vertical ? parentDimensions.height : parentDimensions.width,
    ) *
    (1 - 2 * theme.marginRatio);

  const barThickness = Math.min(
    circular ? theme.baselineArcThickness : theme.baselineBarThickness,
    referenceSize * theme.barThicknessMinSizeRatio,
  );

  const tickLength = barThickness * Math.pow(1 / GOLDEN_RATIO, 3);
  const tickOffset = -tickLength / 2 - barThickness / 2;
  const tickFontSize = Math.min(theme.maxTickFontSize, referenceSize / 25);
  const labelFontSize = Math.min(theme.maxLabelFontSize, referenceSize / 18);
  const centralFontSize = Math.min(theme.maxCentralFontSize, referenceSize / 14);

  const shape = circular ? 'arc' : 'line';

  const abstractGeoms = [
    ...bulletViewModel.bands.map((b, i) => ({
      order: 0,
      landmarks: {
        from: i ? `qualitative_${i - 1}` : 'base',
        to: `qualitative_${i}`,
        yOffset: 'yOffset',
      },
      aes: { shape, fillColor: b.fillColor, lineWidth: barThickness },
    })),
    {
      order: 1,
      landmarks: { from: 'base', to: 'actual', yOffset: 'yOffset' },
      aes: { shape, fillColor: theme.progressLine.stroke, lineWidth: tickLength },
    },
    ...(target
      ? [
          {
            order: 2,
            landmarks: { at: 'target', yOffset: 'yOffset' },
            aes: { shape, fillColor: theme.targetLine.stroke, lineWidth: barThickness / GOLDEN_RATIO },
          },
        ]
      : []),
    ...bulletViewModel.ticks.map((b, i) => ({
      order: 3,
      landmarks: { at: `tick_${i}`, yOffset: 'yOffset' },
      aes: { shape, fillColor: theme.tickLine.stroke, lineWidth: tickLength, axisNormalOffset: tickOffset },
    })),
    ...bulletViewModel.ticks.map((b, i) => ({
      order: 4,
      landmarks: { at: `tick_${i}`, yOffset: 'yOffset' },
      aes: {
        shape: 'text',
        textAlign: vertical ? 'right' : 'center',
        textBaseline: vertical ? 'middle' : 'top',
        fillColor: theme.tickLabel.fill,
        fontShape: { ...theme.tickLabel, fontVariant: 'normal', fontWeight: '500' },
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
        fillColor: theme.majorLabel.fill,
        fontShape: { ...theme.majorLabel, fontVariant: 'normal', fontWeight: '900' },
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
        fillColor: theme.minorLabel.fill,
        fontShape: { ...theme.minorLabel, fontVariant: 'normal', fontWeight: '300' },
      },
    },
    ...(circular
      ? [
          {
            order: 6,
            landmarks: { at: 'centralMajor', yOffset: 'yOffset' },
            aes: {
              shape: 'text',
              textAlign: 'center',
              textBaseline: 'bottom',
              fillColor: theme.majorCenterLabel.fill,
              fontShape: { ...theme.majorCenterLabel, fontVariant: 'normal', fontWeight: '900' },
            },
          },
          {
            order: 6,
            landmarks: { at: 'centralMinor', yOffset: 'yOffset' },
            aes: {
              shape: 'text',
              textAlign: 'center',
              textBaseline: 'top',
              fillColor: theme.minorCenterLabel.fill,
              fontShape: { ...theme.minorCenterLabel, fontVariant: 'normal', fontWeight: '300' },
            },
          },
        ]
      : []),
  ];

  const maxWidth = abstractGeoms.reduce((p, g) => Math.max(p, get<number>(g.aes, 'lineWidth', 0)), 0);
  const r = 0.5 * referenceSize - maxWidth / 2;

  if (circular) {
    const sagitta = getMinSagitta(angleStart, angleEnd, r);
    const maxSagitta = getSagitta((3 / 2) * Math.PI, r);
    const direction = getTransformDirection(angleStart, angleEnd);
    data.yOffset.value = Math.abs(sagitta) >= maxSagitta ? 0 : (direction * (maxSagitta - sagitta)) / 2;
  }

  const fullSize = referenceSize;
  const labelSize = fullSize / 2;
  const pxRangeFrom = -fullSize / 2 + (circular || vertical ? 0 : labelSize);
  const pxRangeTo = fullSize / 2 + (!circular && vertical ? -2 * labelFontSize : 0);
  const pxRangeMid = (pxRangeFrom + pxRangeTo) / 2;
  const pxRange = pxRangeTo - pxRangeFrom;

  const domainExtent = domain[1] - domain[0];

  const linearScale = (x: number) => pxRangeFrom + (pxRange * (x - domain[0])) / domainExtent;

  const angleRange = angleEnd - angleStart;
  const angleScale = (x: number) => angleStart + (angleRange * (x - domain[0])) / domainExtent;
  const clockwise = angleStart > angleEnd; // todo refine this crude approach

  return [...abstractGeoms]
    .sort((a, b) => a.order - b.order)
    .map(({ landmarks, aes }) => {
      const at = get(landmarks, 'at', '');
      const from = get(landmarks, 'from', '');
      const to = get(landmarks, 'to', '');
      const yOffset = get(landmarks, 'yOffset', '');
      const textAlign = circular ? 'center' : get(aes, 'textAlign', '');
      const fontShape = get(aes, 'fontShape', '');
      const axisNormalOffset = get(aes, 'axisNormalOffset', 0);
      const axisTangentOffset = get(aes, 'axisTangentOffset', 0);
      const lineWidth = get(aes, 'lineWidth', 0);
      const yOffsetValue = data[yOffset]?.value ?? 0;

      const strokeStyle = get(aes, 'fillColor', '');
      if (aes.shape === 'text') {
        const { text } = data[at];
        const label = at.slice(0, 5) === 'label';
        const central = at.slice(0, 7) === 'central';
        const textBaseline = label || central || !circular ? get(aes, 'textBaseline', '') : 'middle';
        const fontSize = circular && label ? labelFontSize : circular && central ? centralFontSize : tickFontSize;
        const scaledValue = circular ? angleScale(data[at].value) : data[at] && linearScale(data[at].value);
        // prettier-ignore
        const x = circular
          ? (label || central ? 0 : (r - GOLDEN_RATIO * barThickness) * Math.cos(scaledValue))
          : (vertical ? axisNormalOffset : axisTangentOffset + scaledValue);
        // prettier-ignore
        const y = circular
          ? (label ? r : central ? 0 : -(r - GOLDEN_RATIO * barThickness) * Math.sin(scaledValue))
          : (vertical ? -axisTangentOffset - scaledValue : -axisNormalOffset);
        return new Text(
          x + chartCenter.x,
          y + chartCenter.y + yOffsetValue,
          text,
          textAlign,
          textBaseline,
          fontShape,
          fontSize,
          strokeStyle,
          theme.capturePad,
        );
      } else if (aes.shape === 'arc') {
        const cx = chartCenter.x + pxRangeMid;
        const cy = chartCenter.y + yOffsetValue;
        const radius = at ? r + axisNormalOffset : r;
        const startAngle = at ? angleScale(data[at].value) + Math.PI / 360 : angleScale(data[from].value);
        const endAngle = at ? angleScale(data[at].value) - Math.PI / 360 : angleScale(data[to].value);
        // prettier-ignore
        const anticlockwise = at || clockwise === (data[from].value < data[to].value);
        return new Arc(
          cx,
          cy,
          radius,
          -startAngle,
          -endAngle,
          !anticlockwise,
          lineWidth,
          strokeStyle,
          theme.capturePad,
          theme.arcBoxSamplePitch,
        );
      } else {
        const translateX = chartCenter.x + (vertical ? axisNormalOffset : axisTangentOffset);
        const translateY = chartCenter.y - (vertical ? axisTangentOffset : axisNormalOffset) + yOffsetValue;
        const atPx = data[at] && linearScale(data[at].value);
        const fromPx = at ? atPx - 1 : linearScale(data[from].value);
        const toPx = at ? atPx + 1 : linearScale(data[to].value);
        const x0 = vertical ? translateX : translateX + fromPx;
        const y0 = vertical ? translateY - fromPx : translateY;
        const x1 = vertical ? translateX : translateX + toPx;
        const y1 = vertical ? translateY - toPx : translateY;
        return new Section(x0, y0, x1, y1, lineWidth, strokeStyle, theme.capturePad);
      }
    });
}
