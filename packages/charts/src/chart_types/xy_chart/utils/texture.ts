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
import { ColorVariant, getColorFromVariant } from '../../../utils/common';
import type { Point } from '../../../utils/point';
import type { TexturedStyles } from '../../../utils/themes/theme';
import { TextureShape } from '../../../utils/themes/theme';
import { TextureRendererFn } from '../renderer/shapes_paths';

const getSpacing = ({ spacing }: TexturedStyles): Point => ({
  x: typeof spacing === 'number' ? spacing : spacing?.x ?? 0,
  y: typeof spacing === 'number' ? spacing : spacing?.y ?? 0,
});

const getPath = (
  textureStyle: TexturedStyles,
  size: number,
  strokeWidth: number,
): [path: string | Path2D, rotation: number] => {
  if ('path' in textureStyle) {
    return [textureStyle.path, 0];
  }
  const [pathFn, rotation] = TextureRendererFn[textureStyle.shape];
  // Prevents clipping shapes near edge
  const strokeWidthPadding = [TextureShape.Circle, TextureShape.Square].includes(textureStyle.shape as any)
    ? strokeWidth
    : 0;

  return [pathFn((size - strokeWidthPadding) / 2), rotation];
};

/**
 * Resolves a themed texture into the tile description that each painter turns into its own
 * pattern paint server (see `Painter.createPattern`).
 * @internal
 */
export const getTextureStyles = (
  baseColor: Color | ColorVariant,
  sharedGeometryOpacity: Ratio,
  textureStyle: TexturedStyles,
): Texture => {
  const { size = 10, stroke, strokeWidth = 1, opacity, shapeRotation, fill, dash, rotation, offset } = textureStyle;
  const spacing = getSpacing(textureStyle);
  const [path, pathRotation] = getPath(textureStyle, size, strokeWidth);

  return {
    width: size + spacing.x,
    height: size + spacing.y,
    path,
    shapeRotation: (shapeRotation ?? 0) + pathRotation,
    stroke: getColorFromVariant(baseColor, stroke ?? ColorVariant.Series),
    strokeWidth,
    fill: fill ? getColorFromVariant(baseColor, fill) : undefined,
    dash,
    opacity: sharedGeometryOpacity * (opacity ?? 1),
    rotation,
    offset,
  };
};
