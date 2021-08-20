/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RgbObject } from './color_library_wrappers';

/** @public */
export type Color = string; // todo static/runtime type it this for proper color string content; several places in the code, and ultimate use, dictate it not be an empty string

/** @internal */
export const TRANSPARENT_COLOR: Color = 'rgba(0, 0, 0, 0)';
/** @internal */
export const WHITE_COLOR: Color = 'rgba(255, 255, 255, 1)';
/** @internal */
export const BLACK_COLOR: Color = 'rgba(0, 0, 0, 1)';
/** @internal */
export const RED_COLOR: Color = 'rgba(255, 0, 0, 1)';

/** @internal */
export const RED_RGBOBJ_COLOR: RgbObject = { r: 255, g: 0, b: 0, opacity: 1 };
/** @internal */
export const TRANSPARENT_RBGOBJ_COLOR: RgbObject = { r: 0, g: 0, b: 0, opacity: 0 };
