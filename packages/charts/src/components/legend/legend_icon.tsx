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

const MARKER_SIZE = 8;

/** to limit size, set a min and max */
const getAdjustedRadius = (radius: number | undefined, strokeWidth: number) => {
  const adjustedRadius = isNil(radius) ? strokeWidth : ((MARKER_SIZE / 2) * strokeWidth) / (radius * 2);

  return Math.max(Math.min(adjustedRadius, (radius ?? strokeWidth) * 2), 1);
};

/** @internal */
export const LegendIcon = ({ pointStyle, color }: LegendIconProps) => {
  const { radius = 4, fill, strokeWidth = 1, stroke, shape = PointShape.Circle, opacity = 1 } = pointStyle?.shape
    ? pointStyle ?? {}
    : {
        fill: color,
        stroke: color,
      };

  const adjustedStrokeWidth = getAdjustedRadius(radius, strokeWidth);
  const [shapeFn, rotation] = ShapeRendererFn[shape];
  const adjustedSize = MARKER_SIZE - adjustedStrokeWidth;
  return (
    <svg width={MARKER_SIZE * 2} height={MARKER_SIZE * 2} aria-label={`series color: ${color}`}>
      <g
        transform={`
            translate(${MARKER_SIZE}, ${MARKER_SIZE})
            rotate(${rotation})`}
      >
        <path
          d={pointStyle?.shape === PointShape.Diamond ? shapeFn(adjustedSize / 3) : shapeFn(adjustedSize / 2)}
          stroke={shape ? stroke ?? color : undefined}
          strokeWidth={adjustedStrokeWidth}
          fill={fill}
          opacity={opacity}
        />
      </g>
    </svg>
  );
};
