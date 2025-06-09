/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../common/colors';
import type { Pixels, Distance, Radian, SizeRatio, Ratio } from '../../common/geometry';
import type { Font, PartialFont, FontFamily } from '../../common/text_utils';
import type { ColorVariant, StrokeStyle } from '../common';
import type { PerSideDistance } from '../dimensions';

interface LabelConfig extends Font {
  textColor: Color | typeof ColorVariant.Adaptive;
  valueFont: PartialFont;
  padding: Pixels | Partial<Padding>;
}

/** @public */
export type Padding = Pixels | Partial<PerSideDistance>;

/** @public */
export interface FillLabelConfig extends LabelConfig {
  clipText: boolean;
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

/** @public */
export interface LinkLabelConfig extends LabelConfig {
  fontSize: Pixels; // todo consider putting it in Font
  /**
   * Uses linked labels below this limit of the outer sector arc length (in pixels)
   */
  maximumSection: Distance;
  gap: Pixels;
  spacing: Pixels;
  minimumStemLength: Distance;
  stemAngle: Radian;
  horizontalStemLength: Distance;
  radiusPadding: Distance;
  lineWidth: Pixels;
  /**
   * Limits the total count of linked labels. The first N largest slices are kept.
   */
  maxCount: number;
  /**
   * Limits the total number of characters in linked labels.
   */
  maxTextLength: number;
}

/** @public */
export interface PartitionStyle extends FillFontSizeRange {
  /**
   * The diameter of the inner circle, relative to `outerSizeRatio`
   */
  emptySizeRatio: SizeRatio;
  /**
   * The diameter of the entire circle, relative to the smaller of the usable rectangular size (smaller of width/height minus the margins)
   */
  outerSizeRatio: SizeRatio;
  fontFamily: FontFamily;
  circlePadding: Distance;
  radialPadding: Distance;
  horizontalTextAngleThreshold: Radian;
  horizontalTextEnforcer: Ratio;
  fillLabel: FillLabelConfig;
  linkLabel: LinkLabelConfig;
  sectorLineWidth: Pixels;
  sectorLineStroke: StrokeStyle;

  dimmed: {
    fill: Color | ColorVariant;
    stroke: Color | ColorVariant;
    strokeWidth: Pixels;
  };
}
