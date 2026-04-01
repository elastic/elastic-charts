/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../common/colors';
import type { ColorVariant } from '../common';

/**
 * A color value that can be used for dimmed styling.
 * @internal
 */
type DimmedColor = Color | ColorVariant;

/**
 * Opacity-only dimmed styling configuration.
 * When used, elements are dimmed by reducing opacity while keeping their original color.
 * @internal
 */
type OpacityDimmedConfig = { opacity: number };

/**
 * Color override dimmed styling configuration.
 * When used, elements are dimmed by replacing their color with specific dimmed colors.
 * @internal
 */
type ColorDimmedConfig = {
  fill?: DimmedColor;
  stroke?: DimmedColor;
};

/**
 * Configuration for dimmed (unhighlighted) element styling.
 *
 * The dimmed style can be configured in two ways:
 * - **Opacity-only** (`OpacityDimmedConfig`): Reduces element opacity while keeping original color
 * - **Color override** (`ColorDimmedConfig`): Uses specific fill/stroke colors for the dimmed state
 * @internal
 */
type DimmedStyleConfig = OpacityDimmedConfig | ColorDimmedConfig;

/**
 * Type guard: checks if config uses color overrides (has fill or stroke, no opacity).
 * @internal
 */
function isColorDimmedConfig(config: DimmedStyleConfig): config is ColorDimmedConfig {
  return !('opacity' in config);
}

/**
 * Checks if a dimmed color is configured for the specified color key.
 *
 * Use this when you need to know whether a dimmed color was explicitly configured,
 * for example to determine opacity behavior (use full opacity when dimmed color exists).
 *
 * @param isDimmed - Whether the element is in a dimmed/unhighlighted state
 * @param dimmedConfig - The dimmed style configuration from theme
 * @param colorKey - Which color property to check ('fill' or 'stroke')
 * @returns True if a dimmed color is configured for the specified key
 *
 * @example
 * const hasDimmedFill = hasDimmedColor(isDimmed, rectStyle.dimmed, 'fill');
 * const opacity = hasDimmedFill ? 1 : geometryStateStyle.opacity;
 *
 * @internal
 */
export function hasDimmedColor(
  isDimmed: boolean,
  dimmedConfig: DimmedStyleConfig,
  colorKey: 'fill' | 'stroke',
): boolean {
  return isDimmed && isColorDimmedConfig(dimmedConfig) && dimmedConfig[colorKey] !== undefined;
}

/**
 * Resolves the color to use based on highlight state and dimmed configuration.
 *
 * When an element is dimmed and the theme provides a specific dimmed color,
 * returns that color. Otherwise, returns the default color.
 *
 * @param isDimmed - Whether the element is in a dimmed/unhighlighted state
 * @param dimmedConfig - The dimmed style configuration from theme
 * @param colorKey - Which color property to extract ('fill' or 'stroke')
 * @param defaultColor - Fallback color when not dimmed or no dimmed color configured
 * @returns The dimmed color if configured and applicable, otherwise the default color
 *
 * @example
 * // Always get a color (dimmed or series color):
 * const stroke = getDimmedColor(isDimmed, lineStyle.dimmed, 'stroke', seriesColor);
 *
 * @example
 * // Get dimmed color only if configured (for optional override):
 * const dimmedFill = getDimmedColor(isDimmed, pointStyle.dimmed, 'fill', undefined);
 * const fill = dimmedFill ?? originalFill;
 *
 * @internal
 */
export function getDimmedColor<D extends DimmedColor | undefined>(
  isDimmed: boolean,
  dimmedConfig: DimmedStyleConfig,
  colorKey: 'fill' | 'stroke',
  defaultColor: D,
): DimmedColor | D {
  if (isDimmed && isColorDimmedConfig(dimmedConfig)) {
    const dimmedColor = dimmedConfig[colorKey];
    if (dimmedColor !== undefined) {
      return dimmedColor;
    }
  }
  return defaultColor;
}
