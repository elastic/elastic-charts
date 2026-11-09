/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RgbaTuple } from '../common/color_library_wrappers';
import type { Color } from '../common/colors';
import type { Ratio } from '../common/geometry';
import type { LinearGradient, TexturedStyles } from '../utils/themes/theme';

/** @internal */
export interface Text {
  text: string;
  x: number;
  y: number;
}
/** @internal */
export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** @internal */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** @internal */
export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/**
 * A resolved texture: the repeating tile a rendering backend turns into its pattern paint server
 * (a `CanvasPattern`, an SVG `<pattern>`). Colors are resolved, sizes are in CSS pixels.
 * @public
 */
export interface Texture extends Pick<TexturedStyles, 'rotation' | 'offset'> {
  /** tile width in CSS pixels: the shape size plus the horizontal spacing */
  width: number;
  /** tile height in CSS pixels: the shape size plus the vertical spacing */
  height: number;
  /**
   * the shape as SVG path data, centred on the origin and drawn at the tile centre.
   * A `Path2D` is accepted for backwards compatibility but only paints on canvas.
   */
  path: string | Path2D;
  /** rotation of the shape within its tile, in degrees */
  shapeRotation: number;
  stroke: Color;
  strokeWidth: number;
  fill?: Color;
  dash?: number[];
  /** opacity of the tile's ink, with the geometry's shared opacity folded in */
  opacity: number;
}

/**
 * Linear gradient fill config, currently only used for areas.
 *  @public
 */
export type ResolvedLinearGradient = Required<Omit<LinearGradient, 'stops'>> & {
  stops: Array<{ offset: Ratio; color: RgbaTuple }>;
};

/**
 * Fill style for every geometry
 * @public
 */
export interface Fill {
  /**
   * fill color in rgba
   */
  color: RgbaTuple;
  texture?: Texture;
  /** resolved gradient fill, painted in place of the solid `color` when present */
  gradient?: ResolvedLinearGradient;
}

/**
 * Stroke style for every geometry
 * @public
 */
export interface Stroke {
  /**
   * stroke rgba
   */
  color: RgbaTuple;
  /**
   * stroke width
   */
  width: number;
  /**
   * stroke dash array
   */
  dash?: number[];
}
