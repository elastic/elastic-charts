/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { LegendPositionConfig } from '../../specs/settings';
import { clamp, LayoutDirection } from '../../utils/common';
import type { Margins, Size } from '../../utils/dimensions';
import type { LegendStyle as ThemeLegendStyle } from '../../utils/themes/theme';

/** @internal */
export type LegendStyle =
  | {
      width?: string;
      maxWidth?: string;
      marginLeft?: number;
      marginRight?: number;
    }
  | {
      height?: string;
      maxHeight?: string;
      marginTop?: number;
      marginBottom?: number;
    };

/** @internal */
export interface LegendListStyle {
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  gridTemplateColumns?: string;
}

/**
 * Get the legend list style
 * @internal
 */
export function getLegendListStyle(
  { direction, floating, floatingColumns }: LegendPositionConfig,
  chartMargins: Margins,
  legendStyle: ThemeLegendStyle,
  totalItems: number,
): LegendListStyle {
  const { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight } = chartMargins;

  if (direction === LayoutDirection.Horizontal) {
    return {
      paddingLeft,
      paddingRight,
      gridTemplateColumns: totalItems === 1 ? '1fr' : `repeat(auto-fill, minmax(${legendStyle.verticalWidth}px, 1fr))`,
    };
  }

  return {
    paddingTop,
    paddingBottom,
    ...(floating && {
      gridTemplateColumns: `repeat(${clamp(floatingColumns ?? 1, 1, totalItems)}, auto)`,
    }),
  };
}

/**
 * Get the legend global style
 * @internal
 */
export function getLegendStyle({ direction, floating }: LegendPositionConfig, size: Size, margin: number): LegendStyle {
  if (direction === LayoutDirection.Vertical) {
    const width = `${size.width}px`;
    return {
      width: floating ? undefined : width,
      maxWidth: floating ? undefined : width,
      marginLeft: margin,
      marginRight: margin,
    };
  }
  const height = `${size.height}px`;
  return {
    height,
    maxHeight: height,
    marginTop: margin,
    marginBottom: margin,
  };
}
