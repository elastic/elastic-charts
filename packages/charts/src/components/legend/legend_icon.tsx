/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ShapeRendererFn } from '../../chart_types/xy_chart/renderer/shapes_paths';
import { Color } from '../../utils/common';
import { PointStyle } from '../../utils/themes/theme';
import { Icon } from '../icons/icon';

interface LegendIconProps {
  pointStyle?: PointStyle;
  color: Color;
}

const MARKER_SIZE = 16;
/** @internal */
export const LegendIcon = ({ pointStyle, color }: LegendIconProps) => {
  if (!pointStyle || !pointStyle.shape) {
    return <Icon type="dot" color={color} aria-label={`series color: ${color}`} />;
  }
  const { shape, fill, stroke, strokeWidth, opacity } = pointStyle;
  const [shapeFn, rotation] = ShapeRendererFn[shape];
  const adjustedSize = MARKER_SIZE - strokeWidth;
  return (
    <svg height={MARKER_SIZE} width={MARKER_SIZE} aria-label={`series color: ${color}`}>
      <g
        transform={`
            translate(${MARKER_SIZE / 2}, ${MARKER_SIZE / 2})
            rotate(${rotation})`}
      >
        <path
          d={shapeFn(shape === 'triangle' || shape === 'plus' || shape === 'x' ? adjustedSize / 2 : adjustedSize / 3)}
          stroke={stroke ?? color}
          strokeWidth={strokeWidth}
          fill={fill}
          opacity={opacity}
        />
      </g>
    </svg>
  );
};
