/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ShapeRendererFn } from '../../chart_types/xy_chart/renderer/shapes_paths';
import { Color } from '../../common/colors';
import { PointShape, PointStyle } from '../../utils/themes/theme';
import { getColorFromVariant } from '../../utils/common';

interface LegendIconProps {
  pointStyle?: PointStyle;
  ariaLabel: string;
  color: Color;
}

const MARKER_SIZE = 8;

/** @internal */
export const LegendIcon = ({ pointStyle, color, ariaLabel }: LegendIconProps) => {
  const {
    shape = PointShape.Circle,
    stroke = color,
    strokeWidth = 1,
    opacity = 1,
  } = pointStyle?.shape ? pointStyle : {};
  const [shapeFn, rotation] = ShapeRendererFn[shape];

  const adjustedSize = MARKER_SIZE - (strokeWidth ?? 0);
  return (
    <svg width={MARKER_SIZE * 2} height={MARKER_SIZE * 2} aria-label={ariaLabel}>
      <g
        transform={`
          translate(${MARKER_SIZE}, ${MARKER_SIZE})
          rotate(${rotation})
        `}
      >
        <path
          d={shapeFn(adjustedSize / 2)}
          stroke={getColorFromVariant(color, stroke)}
          strokeWidth={strokeWidth}
          fill={color}
          opacity={opacity}
        />
      </g>
    </svg>
  );
};
