/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { RgbObject } from '../common/color_library_wrappers';
import { Radian } from '../common/geometry';
import { TexturedStyles } from '../utils/themes/theme';

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
export interface Arc {
  x: number;
  y: number;
  radius: number;
  startAngle: Radian;
  endAngle: Radian;
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
   * patern to apply to canvas fill
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
  color: RgbObject;
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
  color: RgbObject;
  /**
   * stroke width
   */
  width: number;
  /**
   * stroke dash array
   */
  dash?: number[];
}
