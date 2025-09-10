/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RgbaTuple } from '../common/color_library_wrappers';
import type { TexturedStyles } from '../utils/themes/theme';

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
 * render options for texture
 * @public
 */
export interface Texture extends Pick<TexturedStyles, 'rotation' | 'offset'> {
  /**
   * pattern to apply to canvas fill
   */
  pattern: CanvasPattern;
}

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
  /**
   * Stroked sides
   */
  strokedSides?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}
