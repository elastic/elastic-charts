/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values as Values } from 'utility-types';

import { Color } from '../../../../common/colors';
import { Distance, Pixels, Radian, Ratio, TimeMs } from '../../../../common/geometry';
import { Font, PartialFont } from '../../../../common/text_utils';
import { PerSideDistance } from '../../../../utils/dimensions';

/** @public */
export const PartitionLayout = Object.freeze({
  sunburst: 'sunburst' as const,
  treemap: 'treemap' as const,
  icicle: 'icicle' as const,
  flame: 'flame' as const,
  mosaic: 'mosaic' as const,
  waffle: 'waffle' as const,
});

/** @public */
export type PartitionLayout = Values<typeof PartitionLayout>; // could use ValuesType<typeof HierarchicalChartTypes>

/** @public */
export type PerSidePadding = PerSideDistance;

/** @public */
export type Padding = Pixels | Partial<PerSidePadding>;

interface LabelConfig extends Font {
  textColor: Color;
  valueFont: PartialFont;
  padding: Padding;
}

/** @public */
export interface FillLabelConfig extends LabelConfig {
  clipText: boolean;
}

/** @public */
export interface LinkLabelConfig extends LabelConfig {
  fontSize: Pixels; // todo consider putting it in Font
  maximumSection: Distance; // use linked labels below this limit
  gap: Pixels;
  spacing: Pixels;
  minimumStemLength: Distance;
  stemAngle: Radian;
  horizontalStemLength: Distance;
  radiusPadding: Distance;
  lineWidth: Pixels;
  maxCount: number;
  maxTextLength: number;
}

/** @public */
export interface FillFontSizeRange {
  minFontSize: Pixels;
  maxFontSize: Pixels;
  idealFontSizeJump: Ratio;
  /**
   * When `maximizeFontSize` is false (the default), text font will not be larger than font sizes in larger sectors/rectangles in the same pie chart,
   * sunburst ring or treemap layer. When it is set to true, the largest font, not exceeding `maxFontSize`, that fits in the slice/sector/rectangle
   * will be chosen for easier text readability, irrespective of the value.
   */
  maximizeFontSize: boolean;
}

/** @alpha */
export type EasingFunction = (x: Ratio) => Ratio;

/** @alpha */
export interface AnimKeyframe {
  time: number;
  easingFunction: EasingFunction;
  // keyframeConfig: Partial<StaticConfig>;
}

/** @public */
export interface AnimationConfig {
  /** @alpha */
  animation?: {
    duration: TimeMs;
    keyframes?: Array<AnimKeyframe>;
  };
}
