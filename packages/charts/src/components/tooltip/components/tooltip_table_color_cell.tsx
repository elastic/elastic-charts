/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import { combineColors, highContrastColor } from '../../../common/color_calcs';
import { colorToRgba, RGBATupleToString } from '../../../common/color_library_wrappers';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTableCell, TooltipTableCellProps } from './tooltip_table_cell';

/** @public */
export type ColorStripCellProps = Omit<TooltipTableCellProps, 'children'> & {
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
  const { backgroundColor } = useTooltipContext();

  const renderColorStrip = (stripColor: string) => {
    const foregroundRGBA = colorToRgba(stripColor);
    const backgroundRGBA = colorToRgba(backgroundColor);
    const blendedFgBg = combineColors(foregroundRGBA, backgroundRGBA);
    const dotColor = RGBATupleToString(highContrastColor(blendedFgBg));
    return (
      <>
        <div className="echTooltip__colorStrip" style={{ backgroundColor }} />
        <div className="echTooltip__colorStrip" style={{ backgroundColor: color, color: dotColor }} />
        <div className="echTooltip__colorStripSpacer" />
      </>
    );
  };

  return (
    <TooltipTableCell
      {...cellProps}
      className={classNames('echTooltip__colorCell', className, {
        'echTooltip__colorCell--empty': !color,
        'echTooltip__colorCell--static': displayOnly,
      })}
    >
      {color ? renderColorStrip(color) : null}
    </TooltipTableCell>
  );
}
