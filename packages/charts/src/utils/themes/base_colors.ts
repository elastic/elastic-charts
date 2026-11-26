/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

import { EUI_DARK, EUI_LIGHT, EUI_SEMANTIC_COLORS } from './eui_borealis_colors.generated';

/** @internal */
export const LIGHT_TEXT_COLORS = EUI_LIGHT.text;
/** @internal */
export const DARK_TEXT_COLORS = EUI_DARK.text;
/** @internal */
export const LIGHT_BORDER_COLORS = EUI_LIGHT.border;
/** @internal */
export const DARK_BORDER_COLORS = EUI_DARK.border;
/** @internal */
export const LIGHT_BACKGROUND_COLORS = EUI_LIGHT.background;
/** @internal */
export const DARK_BACKGROUND_COLORS = EUI_DARK.background;

/**
 * Semantic colors from EUI theme Borealis
 * @internal
 */
export const SEMANTIC_COLORS = EUI_SEMANTIC_COLORS;

const plainLightRGB = chroma(SEMANTIC_COLORS.plainLight).rgb().join(', ');
const shade145RGB = chroma(SEMANTIC_COLORS.shade145).rgb().join(', ');
const shade30RGB = chroma(SEMANTIC_COLORS.shade30).rgb().join(', ');
const shade60RGB = chroma(SEMANTIC_COLORS.shade60).rgb().join(', ');

/**
 * Alpha variants of EUI theme Borealis semantic colors
 * @internal
 */
export const SEMANTIC_ALPHA_COLORS = {
  plainLightAlpha70: `rgba(${plainLightRGB}, 0.7)`,
  shade145Alpha70: `rgba(${shade145RGB}, 0.7)`,
  shade30RGBAlpha15: `rgba(${shade30RGB}, 0.15)`,
  shade30RGBAlpha35: `rgba(${shade30RGB}, 0.35)`,
  shade30RGBAlpha50: `rgba(${shade30RGB}, 0.5)`,
  shade60RGBAlpha15: `rgba(${shade60RGB}, 0.15)`,
  shade60RGBAlpha35: `rgba(${shade60RGB}, 0.35)`,
  shade60RGBAlpha50: `rgba(${shade60RGB}, 0.5)`,
};

/**
 * Custom light colors specific for charts
 * @internal
 */
export const LIGHT_BACKGROUND_COLORS_CUSTOM = {
  backgroundBasePlainAlpha70: SEMANTIC_ALPHA_COLORS.plainLightAlpha70,
};

/**
 * Custom dark colors specific for charts
 * @internal
 */
export const DARK_BACKGROUND_COLORS_CUSTOM = {
  backgroundBasePlainAlpha70: SEMANTIC_ALPHA_COLORS.shade145Alpha70,
};

/** @internal */
export const LIGHT_DIMMED_COLORS = {
  lineStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha35,
  linePointStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha35,
  linePointFill: SEMANTIC_COLORS.plainLight,

  areaFill: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha15,
  areaStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha50,
  areaPointStroke: SEMANTIC_ALPHA_COLORS.shade30RGBAlpha50,
  areaPointFill: SEMANTIC_COLORS.plainLight,

  barFill: SEMANTIC_COLORS.shade15,
  partitionFill: SEMANTIC_COLORS.shade15,
};

/** @internal */
export const DARK_DIMMED_COLORS = {
  lineStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha35,
  linePointStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha35,
  linePointFill: SEMANTIC_COLORS.shade145,

  areaFill: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha15,
  areaStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha35,
  areaPointStroke: SEMANTIC_ALPHA_COLORS.shade60RGBAlpha35,
  areaPointFill: SEMANTIC_COLORS.shade145,

  barFill: SEMANTIC_COLORS.shade110,
  partitionFill: SEMANTIC_COLORS.shade110,
};
