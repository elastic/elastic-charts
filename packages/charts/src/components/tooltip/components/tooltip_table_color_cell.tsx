/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import { useTooltipContext } from './tooltip_provider';
import { TooltipTableCell, TooltipTableCellProps } from './tooltip_table_cell';
import { combineColors, highContrastColor } from '../../../common/color_calcs';
import { colorToRgba, RGBATupleToString } from '../../../common/color_library_wrappers';
import { Color, Colors } from '../../../common/colors';

/** @public */
export type ColorStripCellProps = Omit<TooltipTableCellProps, 'children' | 'width'> & {
  color?: string;
  displayOnly?: boolean;
};

/**
 * Renders color strip column cell
 * @public
 */
export function TooltipTableColorCell({
  color,
  className,
  displayOnly,
  ...cellProps
}: ColorStripCellProps): JSX.Element | null {
  // the backgroundColor is the chart background color, used here to correctly add a background to the stripe
  // to match the same, optionally semi-transparent, color rendered on the chart
  const { backgroundColor, theme } = useTooltipContext();

  const getDotColor = (stripColor: string): Color => {
    if (color === Colors.Transparent.keyword) {
      return theme.defaultDotColor;
    }
    const foregroundRGBA = colorToRgba(stripColor === Colors.Transparent.keyword ? backgroundColor : stripColor);
    const backgroundRGBA = colorToRgba(backgroundColor);
    const blendedFgBg = combineColors(foregroundRGBA, backgroundRGBA);
    return RGBATupleToString(highContrastColor(blendedFgBg, 'WCAG3'));
  };

  const renderColorStrip = () => {
    if (!color) return null;
    const dotColor = getDotColor(color);

    return (
      <>
        <div className="echTooltip__colorStrip--bg" style={{ backgroundColor }} />
        <div className="echTooltip__colorStrip" style={{ backgroundColor: color }}>
          <div className="echTooltip__colorStrip--icon" style={{ fill: dotColor }}>
            {/* Check svg to match eui - https://github.com/elastic/eui/blob/main/src/components/icon/svgs/check.svg?short_path=5a87b2e */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M6.50025,12.00025 C6.37225,12.00025 6.24425,11.95125 6.14625,11.85425 L2.14625,7.85425 C1.95125,7.65825 1.95125,7.34225 2.14625,7.14625 C2.34225,6.95125 2.65825,6.95125 2.85425,7.14625 L6.50025,10.79325 L13.14625,4.14625 C13.34225,3.95125 13.65825,3.95125 13.85425,4.14625 C14.04925,4.34225 14.04925,4.65825 13.85425,4.85425 L6.85425,11.85425 C6.75625,11.95125 6.62825,12.00025 6.50025,12.00025"
              />
            </svg>
          </div>
        </div>
        <div className="echTooltip__colorStrip--spacer" />
      </>
    );
  };

  return (
    <TooltipTableCell
      {...cellProps}
      className={classNames('echTooltip__colorCell', className, {
        'echTooltip__colorCell--static': displayOnly,
      })}
    >
      {renderColorStrip()}
    </TooltipTableCell>
  );
}
