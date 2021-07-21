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
const getAdjustedStrokeWidth = (radius?: number, strokeWidth?: number) => {
  if (isNil(strokeWidth)) return 1;
  const newStrokeWidth = isNil(radius) ? strokeWidth : ((MARKER_SIZE / 2) * strokeWidth) / (radius * 2);

  return Math.max(Math.min(newStrokeWidth, (radius ?? strokeWidth) * 2), newStrokeWidth === 0 ? 0 : 1);
};

/** helper function to determine styling */
const getStyles = (color: Color, styles?: Partial<PointStyle>): Partial<Omit<PointStyle, 'radius'>> => {
  if (!styles) return { fill: color };

  const { radius, fill, strokeWidth, stroke, shape, opacity } = styles;
  return {
    fill,
    shape,
    strokeWidth: getAdjustedStrokeWidth(radius, strokeWidth),
    stroke: stroke ?? color,
    opacity: opacity ?? 1 > 0.5 ? opacity : 1,
  };
};

/** @internal */
export const LegendIcon = ({ pointStyle, color }: LegendIconProps) => {
  const { fill, shape = PointShape.Circle, stroke, strokeWidth, opacity } = getStyles(color, pointStyle);
  const [shapeFn, rotation] = ShapeRendererFn[shape];

  const adjustedSize = MARKER_SIZE - (strokeWidth ?? 0);
  return (
    <svg width={MARKER_SIZE * 2} height={MARKER_SIZE * 2} aria-label={`series color: ${color}`}>
      <g
        transform={`
          translate(${MARKER_SIZE}, ${MARKER_SIZE})
          rotate(${rotation})
        `}
      >
        <path d={shapeFn(adjustedSize / 2)} stroke={stroke} strokeWidth={strokeWidth} fill={fill} opacity={opacity} />
      </g>
    </svg>
  );
};
