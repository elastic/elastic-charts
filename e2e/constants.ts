/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * The playwright tsconfig.json functionality is currently limited to `baseUrl` and `paths`
 * As such there is no easy way to access these transpiled constants from source until the
 * support improves. One alternative would be to transpile all e2e and source files, then
 * run the tests from there but this creates issues with file paths and screenshots.
 * TODO revisit this logic
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export declare type $Values<T extends object> = T[keyof T];

export type Rotation = 0 | 90 | -90 | 180;

export const Placement = Object.freeze({
  Top: 'top' as const,
  Left: 'left' as const,
  Right: 'right' as const,  
  Bottom: 'bottom' as const,
  TopStart: 'top-start' as const,
  TopEnd: 'top-end' as const,
  BottomStart: 'bottom-start' as const,
  BottomEnd: 'bottom-end' as const,
  RightStart: 'right-start' as const,
  RightEnd: 'right-end' as const,
  LeftStart: 'left-start' as const,
  LeftEnd: 'left-end' as const,
  Auto: 'auto' as const,
  AutoStart: 'auto-start' as const,
  AutoEnd: 'auto-end' as const,
});
export type Placement = $Values<typeof Placement>;

export const PartitionLayout = Object.freeze({
  sunburst: 'sunburst' as const,
  treemap: 'treemap' as const,
  icicle: 'icicle' as const,
  flame: 'flame' as const,
  mosaic: 'mosaic' as const,
  waffle: 'waffle' as const,
});
export type PartitionLayout = $Values<typeof PartitionLayout>;

export const Position = Object.freeze({
  Top: 'top' as const,
  Bottom: 'bottom' as const,
  Left: 'left' as const,
  Right: 'right' as const,
});
export type Position = $Values<typeof Position>;

export const SeriesType = Object.freeze({
  Area: 'area' as const,
  Bar: 'bar' as const,
  Line: 'line' as const,
  Bubble: 'bubble' as const,
});
export type SeriesType = $Values<typeof SeriesType>;

export const StackMode = Object.freeze({
  Percentage: 'percentage' as const,
  Wiggle: 'wiggle' as const,
  Silhouette: 'silhouette' as const,
});
export type StackMode = $Values<typeof StackMode>;

export const Fit = Object.freeze({
  None: 'none' as const,
  Carry: 'carry' as const,
  Lookahead: 'lookahead' as const,
  Nearest: 'nearest' as const,
  Average: 'average' as const,
  Linear: 'linear' as const,
  Zero: 'zero' as const,
  Explicit: 'explicit' as const,
});
export type Fit = $Values<typeof Fit>;

export type DisplayValueStyleAlignment = {
  horizontal: Exclude<HorizontalAlignment, 'far' | 'near'>;
  vertical: Exclude<VerticalAlignment, 'far' | 'near'>;
};

export const HorizontalAlignment = Object.freeze({
  Center: 'center' as const,
  Right: Position.Right,
  Left: Position.Left,
  Near: 'near' as const,
  Far: 'far' as const,
});
export type HorizontalAlignment = $Values<typeof HorizontalAlignment>;

export const VerticalAlignment = Object.freeze({
  Middle: 'middle' as const,
  Top: Position.Top,
  Bottom: Position.Bottom,
  Near: 'near' as const,
  Far: 'far' as const,
});
export type VerticalAlignment = $Values<typeof VerticalAlignment>;
