/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ShapeRendererFn } from '../../chart_types/xy_chart/renderer/shapes_paths';
import { Color, isNil } from '../../utils/common';
import { PointShape, PointStyle } from '../../utils/themes/theme';

interface LegendIconProps {
  pointStyle?: PointStyle;
  color: Color;
}

const MARKER_SIZE = 12;

// to limit size, set a min and max
const getRatio = (radius: number | undefined, strokeWidth: number) => {
  const adjustedRadius = isNil(radius) ? strokeWidth : ((MARKER_SIZE / 2) * strokeWidth) / radius / 2;
  if (1.5 > adjustedRadius) return 1.5;
  return Math.max(adjustedRadius, radius ?? strokeWidth * 2);
};

/** @internal */
export const LegendIcon = ({ pointStyle, color }: LegendIconProps) => {
  const { shape, fill, stroke, strokeWidth = 1, opacity, radius } = pointStyle ?? { radius: 4 };

  const adjustedFill = shape ? fill ?? color : color;
  const adjustedStrokeWidth = getRatio(radius, strokeWidth);
  const [shapeFn, rotation] = ShapeRendererFn[shape ?? PointShape.Circle];
  const adjustedSize = MARKER_SIZE - adjustedStrokeWidth;
  return (
    <svg height={MARKER_SIZE} width={MARKER_SIZE} aria-label={`series color: ${color}`}>
      <g
        transform={`
            translate(${MARKER_SIZE / 2}, ${MARKER_SIZE / 2})
            rotate(${rotation})`}
      >
        <path
          d={shapeFn(adjustedSize / 2)}
          stroke={stroke ?? color}
          strokeWidth={adjustedStrokeWidth < 1.5 || adjustedStrokeWidth > radius * 2 ? 1.5 : adjustedStrokeWidth}
          fill={adjustedFill}
          opacity={opacity}
        />
      </g>
    </svg>
  );
};
