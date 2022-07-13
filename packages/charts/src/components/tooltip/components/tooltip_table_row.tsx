/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { Color } from '../../../common/colors';
import { isNil } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTableCell } from './tooltip_table_cell';

type TooltipTableRowProps = PropsOrChildrenWithProps<
  {
    isSeriesHidden?: boolean;
  },
  {},
  {
    color?: Color;
    isHighlighted?: boolean;
    maxHeight?: CSSProperties['maxHeight'];
  }
>;

/** @public */
export const TooltipTableRow = ({
  maxHeight,
  color,
  isHighlighted = false,
  isSeriesHidden,
  ...props
}: TooltipTableRowProps) => {
  const { backgroundColor } = useTooltipContext();
  const className = classNames('echTooltip__tableRow', {
    'echTooltip__tableRow--scrollable': !isNil(maxHeight),
    'echTooltip__tableRow--highlighted': isHighlighted,
  });
  if ('children' in props) {
    return (
      <tr className={className} style={{ maxHeight }}>
        <ColorStripCell color={color} backgroundColor={backgroundColor} />
        {props.children}
      </tr>
    );
  }

  return (
    <tr className={className} style={{ maxHeight }}>
      <ColorStripCell color={color} backgroundColor={backgroundColor} />
      {[1].map((_, i) => (
        <TooltipTableCell key={i}>TODO</TooltipTableCell>
      ))}
    </tr>
  );
};

type ColorStripCellProps = {
  color?: string;
  backgroundColor: string;
};

function ColorStripCell({ color, backgroundColor }: ColorStripCellProps) {
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
