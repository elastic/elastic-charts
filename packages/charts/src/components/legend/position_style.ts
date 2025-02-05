/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CSSProperties } from 'react';

import { LegendSpec, LegendPositionConfig } from '../../specs';
import { LayoutDirection, Position } from '../../utils/common';
import { Dimensions, Size } from '../../utils/dimensions';

const INSIDE_PADDING = 10;

/** @internal */
export function legendPositionStyle(
  { legendPosition }: LegendSpec,
  legendSize: Size,
  chart: Dimensions,
  container: Dimensions,
): CSSProperties {
  const { vAlign, hAlign, direction, floating } = getLegendPositionConfig(legendPosition);
  // non-float legend doesn't need a special handling
  if (!floating) {
    return {};
  }

  const { Left, Right, Top, Bottom } = Position;

  if (direction === LayoutDirection.Vertical) {
    return {
      position: 'absolute',
      zIndex: 1,
      right: hAlign === Right ? container.width - chart.width - chart.left + INSIDE_PADDING : undefined,
      left: hAlign === Left ? chart.left + INSIDE_PADDING : undefined,
      top: vAlign === Top ? chart.top : undefined,
      bottom: vAlign === Bottom ? container.height - chart.top - chart.height : undefined,
      height: legendSize.height >= chart.height ? chart.height : undefined,
    };
  }

  return {
    position: 'absolute',
    zIndex: 1,
    right: INSIDE_PADDING,
    left: chart.left + INSIDE_PADDING,
    top: vAlign === Top ? chart.top : undefined,
    bottom: vAlign === Bottom ? container.height - chart.top - chart.height : undefined,
    height: legendSize.height >= chart.height ? chart.height : undefined,
  };
}

/** @internal */
export const LEGEND_TO_FULL_CONFIG: Record<Position, LegendPositionConfig> = {
  [Position.Left]: {
    vAlign: Position.Top,
    hAlign: Position.Left,
    direction: LayoutDirection.Vertical,
    floating: false,
    floatingColumns: 1,
  },
  [Position.Top]: {
    vAlign: Position.Top,
    hAlign: Position.Left,
    direction: LayoutDirection.Horizontal,
    floating: false,
    floatingColumns: 1,
  },
  [Position.Bottom]: {
    vAlign: Position.Bottom,
    hAlign: Position.Left,
    direction: LayoutDirection.Horizontal,
    floating: false,
    floatingColumns: 1,
  },
  [Position.Right]: {
    vAlign: Position.Top,
    hAlign: Position.Right,
    direction: LayoutDirection.Vertical,
    floating: false,
    floatingColumns: 1,
  },
};

/**
 * @internal
 */
export function getLegendPositionConfig(position: LegendSpec['legendPosition']): LegendPositionConfig {
  return typeof position === 'object' ? position : LEGEND_TO_FULL_CONFIG[position];
}
