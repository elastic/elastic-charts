/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartBaseColors } from './theme';

/**
 * Base light theme colors designed to match eui, see https://eui.elastic.co/#/theming/colors/values#shades
 * @internal
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
 * @internal
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
  blueGrey20: '#E3E8F2',
  blueGrey30: '#CAD3E2',
  blueGrey60: '#8E9FBC',
  blueGrey95: '#516381',
  blueGrey120: '#2B394F',
  blueGrey130: '#1D2A3E',
};

/** @internal */
export const SEMANTIC_COLORS = {
  shade20: PRIMITIVE_COLORS.blueGrey20,
  shade30: PRIMITIVE_COLORS.blueGrey30,
  shade60: PRIMITIVE_COLORS.blueGrey60,
  shade95: PRIMITIVE_COLORS.blueGrey95,
  shade120: PRIMITIVE_COLORS.blueGrey120,
  shade130: PRIMITIVE_COLORS.blueGrey130,
};

/** @internal */
export const DARK_BORDER_COLORS = {
  borderBaseSubdued: SEMANTIC_COLORS.shade120,
};

/** @internal */
export const LIGHT_BORDER_COLORS = {
  borderBaseSubdued: SEMANTIC_COLORS.shade20,
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
