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
import type { ColorVariant, HorizontalAlignment, StrokeStyle, VerticalAlignment } from '../common';
import type { PerSideDistance } from '../dimensions';

/** @public */
export type PartitionDimmedStyle =
  | { opacity: number }
  | {
      /** The fill color to use when partition slices are dimmed. */
      fill: Color | ColorVariant;
    };

interface LabelConfig extends Font {
  textColor: Color | typeof ColorVariant.Adaptive;
  valueFont: PartialFont;
  padding: Pixels | Partial<Padding>;
}

/** @public */
export type Padding = Pixels | Partial<PerSideDistance>;

/**
 * Vertical placement of a fill label within its container.
 * `top` aligns the label block to the top of the available area, `bottom` to the bottom,
 * and `middle` centers the label block on the midpoint of the area, ignoring the label padding.
 * Only applies to the rectangular layouts (treemap, mosaic, flame, and icicle); sunburst and pie
 * labels are always centered within their sector.
 * @public
 */
export type FillLabelVerticalAlignment = Exclude<VerticalAlignment, 'far' | 'near'>;

/**
 * Horizontal placement of a fill label within its container.
 * Each row of a wrapped label is placed independently, so `center` centers every
 * row and `left` and `right` align every row to the same edge.
 * Only applies to the rectangular layouts (treemap, mosaic, flame, and icicle); sunburst
 * and pie labels are always centered within their sector.
 * @public
 */
export type FillLabelHorizontalAlignment = Exclude<HorizontalAlignment, 'far' | 'near'>;

/** @public */
export interface FillLabelConfig extends LabelConfig {
  clipText: boolean;
  /**
   * Overrides the layout dependent default vertical alignment of the fill label.
   * Only applies to the rectangular layouts (treemap, mosaic, flame, and icicle); sunburst and pie
   * labels are always centered within their sector.
   * When left undefined, labels are vertically centered for flame and icicle layouts,
   * top aligned for treemap and mosaic layouts with a single layer, and bottom aligned for
   * the outer layers of nested treemap and mosaic layouts, leaving room for the parent labels.
   */
  verticalAlignment?: FillLabelVerticalAlignment;
  /**
   * Overrides the layout dependent default horizontal alignment of the fill label.
   * Only applies to the rectangular layouts (treemap, mosaic, flame, and icicle); sunburst and pie
   * labels are always centered within their sector.
   * When left undefined, labels are left aligned for all layouts but sunburst,
   * whose labels are centered to avoid overlapping their sectors.
   */
  horizontalAlignment?: FillLabelHorizontalAlignment;
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
  /**
   * The style applied to partition slices when they are dimmed relative to other highlighted elements.
   * This is typically used to visually de-emphasize slices when hovering over a legend item.
   */
  dimmed: PartitionDimmedStyle;
}
