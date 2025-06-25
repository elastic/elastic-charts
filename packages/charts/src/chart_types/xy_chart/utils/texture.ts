/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../common/colors';
import type { Ratio } from '../../../common/geometry';
import type { Texture } from '../../../geoms/types';
import { ColorVariant, degToRad, getColorFromVariant } from '../../../utils/common';
import type { Point } from '../../../utils/point';
import type { TexturedStyles } from '../../../utils/themes/theme';
import { TextureShape } from '../../../utils/themes/theme';
import { TextureRendererFn } from '../renderer/shapes_paths';

const getSpacing = ({ spacing }: TexturedStyles): Point => ({
  x: typeof spacing === 'number' ? spacing : spacing?.x ?? 0,
  y: typeof spacing === 'number' ? spacing : spacing?.y ?? 0,
});

const getPath = (textureStyle: TexturedStyles, size: number, strokeWidth: number): [path: Path2D, rotation: number] => {
  if ('path' in textureStyle) {
    const path = typeof textureStyle.path === 'string' ? new Path2D(textureStyle.path) : textureStyle.path;

    return [path, 0];
  }
  const [pathFn, rotation] = TextureRendererFn[textureStyle.shape];
  // Prevents clipping shapes near edge
  const strokeWidthPadding = [TextureShape.Circle, TextureShape.Square].includes(textureStyle.shape as any)
    ? strokeWidth
    : 0;

  return [new Path2D(pathFn((size - strokeWidthPadding) / 2)), rotation];
};

/** @internal */
function createPattern(
  ctx: CanvasRenderingContext2D,
  dpi: number,
  patternCanvas: HTMLCanvasElement,
  baseColor: Color | ColorVariant,
  sharedGeometryOpacity: Ratio,
  textureStyle: TexturedStyles,
): CanvasPattern | null {
  const pCtx = patternCanvas.getContext('2d');
  if (!pCtx) return null;

  const { size = 10, stroke, strokeWidth = 1, opacity, shapeRotation, fill, dash } = textureStyle;

  const spacing = getSpacing(textureStyle);
  const cssWidth = size + spacing.x;
  const cssHeight = size + spacing.y;
  patternCanvas.width = dpi * cssWidth;
  patternCanvas.height = dpi * cssHeight;

  pCtx.globalAlpha = sharedGeometryOpacity * (opacity ?? 1);
  pCtx.lineWidth = strokeWidth;

  pCtx.strokeStyle = getColorFromVariant(baseColor, stroke ?? ColorVariant.Series);
  if (dash) pCtx.setLineDash(dash);

  if (fill) pCtx.fillStyle = getColorFromVariant(baseColor, fill);

  const [path, pathRotation] = getPath(textureStyle, size, strokeWidth);
  const itemRotation = (shapeRotation ?? 0) + pathRotation;

  pCtx.scale(dpi, dpi);
  pCtx.translate(cssWidth / 2, cssHeight / 2);

  if (itemRotation) pCtx.rotate(degToRad(itemRotation));

  pCtx.beginPath();

  if (path) {
    pCtx.stroke(path);
    if (fill) pCtx.fill(path);
  }

  const pattern = ctx.createPattern(patternCanvas, 'repeat')!; // HTMLCanvasElement always yields a CanvasPattern anyway

  const { offset, rotation } = textureStyle;
  const matrix = new DOMMatrix([1 / dpi, 0, 0, 1 / dpi, 0, 0]);
  if (offset?.global) matrix.translateSelf(offset.x ?? 0, offset.y ?? 0);
  matrix.rotateSelf(rotation ?? 0);
  if (offset && !offset.global) matrix.translateSelf(offset.x ?? 0, offset.y ?? 0);

  pattern.setTransform(matrix);
  return pattern;
}

/** @internal */
export const getTextureStyles = (
  ctx: CanvasRenderingContext2D,
  patternCanvas: HTMLCanvasElement,
  baseColor: Color | ColorVariant,
  sharedGeometryOpacity: Ratio,
  texture: TexturedStyles,
): Texture | undefined => {
  const dpi = window.devicePixelRatio;
  const pattern = createPattern(ctx, dpi, patternCanvas, baseColor, sharedGeometryOpacity, texture);

  if (!pattern) return;

  const { rotation, offset } = texture;

  return {
    pattern,
    rotation,
    offset,
  };
};
