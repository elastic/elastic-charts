/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { MouseEventHandler } from 'react';
import React, { forwardRef, memo } from 'react';

import { LegendIcon } from './legend_icon';
import type { PointStyle } from '../../utils/themes/theme';
import { Icon } from '../icons/icon';

interface ColorProps {
  color: string;
  seriesName: string;
  hasColorPicker: boolean;
  isSeriesHidden?: boolean;
  pointStyle?: PointStyle;
  onClick?: MouseEventHandler;
}

/**
 * Color component used by the legend item
 * @internal
 */
export const Color = memo(
  forwardRef<HTMLButtonElement, ColorProps>(
    ({ color, seriesName, isSeriesHidden = false, hasColorPicker, onClick, pointStyle }, ref) => {
      if (isSeriesHidden) {
        return (
          <div className="echLegendItem__color" title="series hidden">
            {/* changing the default viewBox for the eyeClosed icon to keep the same dimensions */}
            <Icon type="eyeClosed" viewBox="-3 -3 22 22" aria-label={`series ${seriesName} is hidden`} />
          </div>
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
            <LegendIcon pointStyle={pointStyle} color={color} ariaLabel={`Change series color, currently ${color}`} />
          </button>
        );
      }

      return (
        <div className="echLegendItem__color" title="series color">
          <LegendIcon pointStyle={pointStyle} color={color} ariaLabel={`series color: ${color}`} />
        </div>
      );
    },
  ),
);
Color.displayName = 'Color';
