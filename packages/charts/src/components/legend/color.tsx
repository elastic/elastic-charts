/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { MouseEventHandler, forwardRef, memo } from 'react';
import { Required } from 'utility-types';

import { ShapeRendererFn } from '../../chart_types/xy_chart/renderer/shapes_paths';
import { SeriesType } from '../../specs';
import { PointShape, PointStyle } from '../../utils/themes/theme';
import { Icon } from '../icons/icon';

interface ColorProps {
  color: string;
  seriesName: string;
  hasColorPicker: boolean;
  seriesType?: SeriesType;
  isSeriesHidden?: boolean;
  pointStyle?: PointStyle;
  onClick?: MouseEventHandler;
}
const MARKER_SIZE = 16;
const getCustomization = (pointStyle: PointStyle, seriesType: SeriesType): boolean | undefined =>
  (seriesType &&
    // bubble charts will always have the circle icon vs dot
    seriesType === 'bubble') ||
  (seriesType === 'line' && pointStyle.shape !== PointShape.Circle) ||
  (seriesType === 'area' && pointStyle.shape !== PointShape.Circle)
    ? // not the default radius from theme
      pointStyle.radius !== 2 ||
      // always want the circle svg vs dot.tsx with bubble chart
      seriesType === 'bubble'
    : // how to check the fill and stroke different than defaults
      false;

/**
 * Color component used by the legend item
 * @internal
 */
export const Color = memo(
  forwardRef<HTMLButtonElement, ColorProps>(
    ({ color, seriesName, isSeriesHidden = false, hasColorPicker, onClick, pointStyle, seriesType }, ref) => {
      if (isSeriesHidden) {
        return (
          <div className="echLegendItem__color" title="series hidden">
            {/* changing the default viewBox for the eyeClosed icon to keep the same dimensions */}
            <Icon type="eyeClosed" viewBox="-3 -3 22 22" aria-label={`series ${seriesName} is hidden`} />
          </div>
        );
      }

      function renderShape({ shape, fill, stroke, strokeWidth, opacity }: Required<PointStyle, 'shape'>) {
        const [shapeFn, rotation] = ShapeRendererFn[shape];
        const adjustedSize = MARKER_SIZE - strokeWidth;
        return (
          <svg height={MARKER_SIZE} width={MARKER_SIZE}>
            <g
              transform={`
                translate(${MARKER_SIZE / 2}, ${MARKER_SIZE / 2})
                rotate(${rotation})`}
            >
              <path
                d={shapeFn(
                  shape === 'triangle' || shape === 'plus' || shape === 'x' ? adjustedSize / 2 : adjustedSize / 3,
                )}
                stroke={stroke ?? color}
                strokeWidth={strokeWidth}
                fill={fill}
                opacity={opacity}
              />
            </g>
          </svg>
        );
      }

      if (hasColorPicker) {
        return (
          <button
            type="button"
            onClick={onClick}
            className="echLegendItem__color echLegendItem__color--changable"
            title="change series color"
            ref={ref}
          >
            <Icon type="dot" color={color} aria-label={`Change series color, currently ${color}`} />
          </button>
        );
      }

      return (
        <div className="echLegendItem__color" title="series color">
          {pointStyle && getCustomization(pointStyle, seriesType!) ? (
            // @ts-ignore
            renderShape(pointStyle)
          ) : (
            <Icon type="dot" color={color} aria-label={`series color: ${color}`} />
          )}
        </div>
      );
    },
  ),
);
Color.displayName = 'Color';
