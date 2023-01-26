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
        <div className="echTooltip__colorStrip" style={{ backgroundColor: color, color: dotColor }} />
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
