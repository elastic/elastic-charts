/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

import { ChartBaseColors } from './theme';

/**
 * Base light theme colors designed to match eui, see https://eui.elastic.co/#/theming/colors/values#shades
 * @public
 */
export const LIGHT_BASE_COLORS: ChartBaseColors = {
  emptyShade: '#FFF',
  lightestShade: '#F1F4FA',
  lightShade: '#D3DAE6',
  mediumShade: '#98A2B3',
  darkShade: '#69707D',
  darkestShade: '#343741',
  title: '#1A1C21',
};

/**
 * Base dark theme colors designed to match eui, see https://eui.elastic.co/#/theming/colors/values#shades
 * @public
 */
export const DARK_BASE_COLORS: ChartBaseColors = {
  emptyShade: '#1D1E24',
  lightestShade: '#25262E',
  lightShade: '#343741',
  mediumShade: '#535966',
  darkShade: '#98A2B3',
  darkestShade: '#D4DAE5',
  title: '#DFE5EF',
};

/** @internal */
export const PRIMITIVE_COLORS = {
  white: '#FFFFFF',
  blue100: '#1750BA',
  blueGrey15: '#ECF1F9',
  blueGrey20: '#E3E8F2',
  blueGrey30: '#CAD3E2',
  blueGrey60: '#8E9FBC',
  blueGrey95: '#516381',
  blueGrey100: '#485975',
  blueGrey120: '#2B394F',
  blueGrey130: '#1D2A3E',
  primary100: '#1750BA',
};

/** @internal */
export const SEMANTIC_COLORS = {
  plainLight: PRIMITIVE_COLORS.white,
  shade15: PRIMITIVE_COLORS.blueGrey15,
  shade20: PRIMITIVE_COLORS.blueGrey20,
  shade30: PRIMITIVE_COLORS.blueGrey30,
  shade60: PRIMITIVE_COLORS.blueGrey60,
  shade95: PRIMITIVE_COLORS.blueGrey95,
  shade100: PRIMITIVE_COLORS.blueGrey100,
  shade120: PRIMITIVE_COLORS.blueGrey120,
  shade130: PRIMITIVE_COLORS.blueGrey130,
  primary100: PRIMITIVE_COLORS.blue100,
};

const primary100RGB = chroma(SEMANTIC_COLORS.primary100).rgb().join(' ');
const plainLightRGB = chroma(SEMANTIC_COLORS.plainLight).rgb().join(' ');

/** @internal */
export const SEMANTIC_ALPHA_COLORS = {
  primary100Alpha4: `rgba(${primary100RGB} / 0.04)`,
  plainLightAlpha8: `rgba(${plainLightRGB} / 0.08)`,
};

/** @internal */
export const DARK_BORDER_COLORS = {
  borderBaseSubdued: SEMANTIC_COLORS.shade120,
  borderBasePlain: SEMANTIC_COLORS.shade100,
};

/** @internal */
export const LIGHT_BORDER_COLORS = {
  borderBaseSubdued: SEMANTIC_COLORS.shade20,
  borderBasePlain: SEMANTIC_COLORS.shade30,
};

/** @internal */
export const DARK_TEXT_COLORS = {
  textParagraph: SEMANTIC_COLORS.shade30,
  textSubdued: SEMANTIC_COLORS.shade60,
};
/** @internal */
export const LIGHT_TEXT_COLORS = {
  textParagraph: SEMANTIC_COLORS.shade130,
  textSubdued: SEMANTIC_COLORS.shade95,
};

/** @internal */
export const LIGHT_BACKGROUND_COLORS = {
  backgroundBaseDisabled: SEMANTIC_COLORS.shade15,
  backgroundBaseInteractiveHover: SEMANTIC_ALPHA_COLORS.primary100Alpha4,
};

/** @internal */
export const DARK_BACKGROUND_COLORS = {
  backgroundBaseDisabled: SEMANTIC_COLORS.shade130,
  backgroundBaseInteractiveHover: SEMANTIC_ALPHA_COLORS.plainLightAlpha8,
};
