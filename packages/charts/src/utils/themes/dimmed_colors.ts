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
 * Opacity-only dimmed styling configuration.
 * When used, elements are dimmed by reducing opacity while keeping their original color.
 *
 * Note: This is a base type for the utility functions. The actual theme interfaces
 * (PointStyle, LineStyle, etc.) have more specific inline types that may include
 * additional properties like `texture` or `strokeWidth`.
 * @internal
 */
type OpacityDimmedConfig = { opacity: number };

/**
 * Color override dimmed styling configuration.
 * When used, elements are dimmed by replacing their color with specific dimmed colors.
 *
 * Note: This is a base type for the utility functions. The actual theme interfaces
 * may include additional properties beyond fill/stroke.
 * @internal
 */
type ColorDimmedConfig = {
  fill?: Color | ColorVariant;
  stroke?: Color | ColorVariant;
};

/**
 * Configuration for dimmed (unhighlighted) element styling.
 *
 * The dimmed style can be configured in two ways:
 * - **Opacity-only** (`OpacityDimmedConfig`): Reduces element opacity while keeping original color
 * - **Color override** (`ColorDimmedConfig`): Uses specific colors for the dimmed state
 *
 * This is a simplified union type used by the utility functions. The actual theme
 * interfaces (PointStyle, LineStyle, AreaStyle, RectStyle, ArcStyle) define their
 * own inline dimmed types with style-specific additional properties.
 * @internal
 */
type DimmedStyleConfig = OpacityDimmedConfig | ColorDimmedConfig;

/**
 * Checks if a dimmed configuration uses color override (not opacity-only).
 * @internal
 */
function isColorDimmedConfig(config: DimmedStyleConfig): config is ColorDimmedConfig {
  return !('opacity' in config);
}

/**
 * Checks if a dimmed color is configured for the specified color key.
 *
 * Use this when you need to know whether a dimmed color was explicitly configured,
 * for example to determine opacity behavior.
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
  dimmedConfig: DimmedStyleConfig | undefined,
  colorKey: 'fill' | 'stroke',
): boolean {
  return isDimmed && !!dimmedConfig && isColorDimmedConfig(dimmedConfig) && colorKey in dimmedConfig;
}

/**
 * Resolves the color to use based on highlight state and dimmed configuration.
 *
 * When an element is dimmed (unhighlighted) and the theme provides a specific dimmed color,
 * this function returns that dimmed color. Otherwise, it returns the default color.
 *
 * The dimmed style config can be either:
 * - `OpacityDimmedConfig` - Opacity-only dimming (returns default color, opacity handled separately)
 * - `ColorDimmedConfig` - Explicit dimmed colors (returns the specified color)
 *
 * @param isDimmed - Whether the element is in a dimmed/unhighlighted state
 * @param dimmedConfig - The dimmed style configuration from theme (e.g., `pointStyle.dimmed`)
 * @param colorKey - Which color property to extract ('fill' or 'stroke')
 * @param defaultColor - Fallback color when not dimmed or no dimmed color is configured.
 *                       Can be `undefined` when you only want the dimmed color or nothing.
 * @returns The resolved color - either the dimmed color or the default color
 *
 * @example
 * // In a point renderer:
 * const fillColor = getDimmedColor(
 *   highlightState === 'dimmed',
 *   pointStyle.dimmed,
 *   'fill',
 *   seriesColor
 * );
 *
 * @example
 * // In a line renderer:
 * const strokeColor = getDimmedColor(
 *   highlightState === 'dimmed',
 *   lineStyle.dimmed,
 *   'stroke',
 *   seriesColor
 * );
 *
 * @example
 * // Get dimmed color only (undefined if not configured):
 * const dimmedFill = getDimmedColor(isDimmed, pointStyle.dimmed, 'fill', undefined);
 *
 * @internal
 */
export function getDimmedColor<T extends Color | ColorVariant | undefined>(
  isDimmed: boolean,
  dimmedConfig: DimmedStyleConfig | undefined,
  colorKey: 'fill' | 'stroke',
  defaultColor: T,
): T {
  if (hasDimmedColor(isDimmed, dimmedConfig, colorKey)) {
    const dimmedColor = (dimmedConfig as ColorDimmedConfig)[colorKey];
    if (dimmedColor !== undefined) {
      return dimmedColor as T;
    }
  }
  return defaultColor;
}
