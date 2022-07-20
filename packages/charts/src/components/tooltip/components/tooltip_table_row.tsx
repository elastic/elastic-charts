/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, PropsWithChildren } from 'react';

import { Color } from '../../../common/colors';
import { isNil } from '../../../utils/common';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTableCell } from './tooltip_table_cell';

type TooltipTableRowProps = PropsWithChildren<{
  color?: Color;
  isHighlighted?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
}>;

/** @public */
export const TooltipTableRow = ({ maxHeight, color, isHighlighted = false, children }: TooltipTableRowProps) => {
  const { backgroundColor, hideColor } = useTooltipContext();
  const className = classNames('echTooltip__tableRow', {
    'echTooltip__tableRow--scrollable': !isNil(maxHeight),
    'echTooltip__tableRow--highlighted': isHighlighted,
  });

  return (
    <tr className={className} style={{ maxHeight }}>
      <ColorStripCell hide={hideColor} color={color} backgroundColor={backgroundColor} />
      {children}
    </tr>
  );
};

type ColorStripCellProps = {
  color?: string;
  backgroundColor: string;
  hide?: boolean;
};

function ColorStripCell({ color, backgroundColor, hide }: ColorStripCellProps): JSX.Element | null {
  if (hide) return null;

  return (
    <TooltipTableCell
      className={classNames('echTooltip__colorCell', {
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
