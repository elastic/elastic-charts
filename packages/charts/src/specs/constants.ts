/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import { BOTTOM, CENTER, LEFT, MIDDLE, RIGHT, TOP } from '../common/constants';

/**
 * Type of bin aggregations
 * @public
 */
export const BinAgg = Object.freeze({
  /**
   * Order by sum of values in bin
   */
  Sum: 'sum' as const,
  /**
   * Order of values are used as is
   */
  None: 'none' as const,
});
/** @public */
export type BinAgg = $Values<typeof BinAgg>;

/**
 * Direction of sorting
 * @public
 */
export const Direction = Object.freeze({
  /**
   * Least to greatest
   */
  Ascending: 'ascending' as const,
  /**
   * Greatest to least
   */
  Descending: 'descending' as const,
});
/** @public */
export type Direction = $Values<typeof Direction>;

/**
 * This enums provides the available tooltip types
 * @public
 */
export const TooltipType = Object.freeze({
  /** Vertical cursor parallel to x axis */
  VerticalCursor: 'vertical' as const,
  /** Vertical and horizontal cursors */
  Crosshairs: 'cross' as const,
  /** Follow the mouse coordinates */
  Follow: 'follow' as const,
  /** Hide every tooltip */
  None: 'none' as const,
});
/**
 * The TooltipType
 * @public
 */
export type TooltipType = $Values<typeof TooltipType>;

/**
 * The position to stick the tooltip to
 * @public
 */
export const TooltipStickTo = Object.freeze({
  Top: TOP,
  Bottom: BOTTOM,
  Middle: MIDDLE,
  Left: LEFT,
  Right: RIGHT,
  Center: CENTER,
  MousePosition: 'MousePosition' as const,
});
/** @public */
export type TooltipStickTo = $Values<typeof TooltipStickTo>;
