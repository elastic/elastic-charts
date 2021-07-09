/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
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
  seriesType: SeriesType;
  isSeriesHidden?: boolean;
  pointStyle?: PointStyle;
  onClick?: MouseEventHandler;
}
const MARKER_SIZE = 16;
const getCustomization = (pointStyle: PointStyle, seriesType: SeriesType): boolean | undefined =>
  // bubble charts will always have the circle icon vs dot
  seriesType === 'bubble' ||
  (pointStyle.shape !== PointShape.Circle && seriesType === 'area') ||
  (pointStyle.shape !== PointShape.Circle && seriesType === 'line')
    ? pointStyle.radius !== 2 ||
      seriesType === 'bubble' ||
      pointStyle?.visible ||
      pointStyle.stroke !== 'white' ||
      pointStyle.fill !== 'blue'
    : false;

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
          {pointStyle && getCustomization(pointStyle, seriesType) ? (
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
