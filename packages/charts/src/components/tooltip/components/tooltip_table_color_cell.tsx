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

/** @public */
export type ColorStripCellProps = Omit<TooltipTableCellProps, 'children'> & {
  color?: string;
};

/**
 * Renders color strip column cell
 * @public
 */
export function TooltipTableColorCell({ color, className, ...cellProps }: ColorStripCellProps): JSX.Element | null {
  const { backgroundColor } = useTooltipContext();
  return (
    <TooltipTableCell
      {...cellProps}
      className={classNames('echTooltip__colorCell', className, {
        'echTooltip__colorCell--empty': !color,
      })}
    >
      {color ? (
        <>
          <div className="echTooltip__colorStrip" style={{ backgroundColor }} />
          <div className="echTooltip__colorStrip" style={{ backgroundColor: color }} />
          <div className="echTooltip__colorStripSpacer" />
        </>
      ) : null}
    </TooltipTableCell>
  );
}
