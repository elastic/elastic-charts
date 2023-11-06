/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BulletColorConfig } from './utils/color';
import { Color } from '../../common/colors';
import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import { Pixels } from '../../common/geometry';
import { Font } from '../../common/text_utils';
import { Padding } from '../../utils/dimensions';
import { DARK_BASE_COLORS, LIGHT_BASE_COLORS } from '../../utils/themes/base_colors';

/** @public */
export interface BulletGraphStyle {
  textColor: Color;
  border: Color;
  barBackground: Color;
  /**
   * Default band colors when not defined on spec
   */
  colorBands: BulletColorConfig;
  nonFiniteText: string;
  minHeight: Pixels;
  angularTickLabelPadding: Pixels;
  fallbackBandColor: Color;
}

/** @internal */
export const LIGHT_THEME_BULLET_STYLE: BulletGraphStyle = {
  textColor: LIGHT_BASE_COLORS.darkestShade,
  border: '#EDF0F5',
  barBackground: LIGHT_BASE_COLORS.darkestShade,
  colorBands: ['#D9C6EF', '#AA87D1'],
  nonFiniteText: 'N/A',
  minHeight: 64,
  angularTickLabelPadding: 10,
  fallbackBandColor: LIGHT_BASE_COLORS.mediumShade,
};

/** @internal */
export const DARK_THEME_BULLET_STYLE: BulletGraphStyle = {
  textColor: '#E0E5EE',
  border: DARK_BASE_COLORS.lightShade,
  barBackground: '#FFF',
  colorBands: ['#6092C0', '#3F4E61'],
  nonFiniteText: 'N/A',
  minHeight: 64,
  angularTickLabelPadding: 10,
  fallbackBandColor: DARK_BASE_COLORS.mediumShade,
};

/** @internal */
export const TITLE_FONT: Font = {
  fontStyle: 'normal',
  fontFamily: DEFAULT_FONT_FAMILY,
  fontVariant: 'normal',
  fontWeight: 'bold',
  textColor: 'black',
};
/** @internal */
export const TITLE_FONT_SIZE = 16;
/** @internal */
export const TITLE_LINE_HEIGHT = 19;

/** @internal */
export const SUBTITLE_FONT: Font = {
  ...TITLE_FONT,
  fontWeight: 'normal',
};
/** @internal */
export const SUBTITLE_FONT_SIZE = 14;
/** @internal */
export const SUBTITLE_LINE_HEIGHT = 16;

/** @internal */
export const VALUE_FONT: Font = {
  ...TITLE_FONT,
};
/** @internal */
export const VALUE_FONT_SIZE = 22;
/** @internal */
export const VALUE_LINE_HEIGHT = 22;

/** @internal */
export const TARGET_FONT: Font = {
  ...SUBTITLE_FONT,
};
/** @internal */
export const TARGET_FONT_SIZE = 16;
/** @internal */
export const TARGET_LINE_HEIGHT = 16;

/** @internal */
export const TICK_FONT: Font = {
  ...TITLE_FONT,
  fontWeight: 'normal',
};
/** @internal */
export const TICK_FONT_SIZE = 10;

/** @internal */
export const HEADER_PADDING: Padding = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
};
/** @internal */
export const GRAPH_PADDING: Padding = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
};
