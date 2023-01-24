/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import { useTooltipContext } from './tooltip_provider';
import { isNil } from '../../../utils/common';

type TooltipTableRowProps = PropsWithChildren<{
  id?: string;
  className?: string;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}>;

/** @public */
export const TooltipTableRow = ({
  id,
  isHighlighted = false,
  isSelected = false,
  children,
  onSelect,
  className,
}: TooltipTableRowProps) => {
  const { actionable } = useTooltipContext();

  const isSelectable = actionable && !isNil(onSelect);
  const classes = classNames('echTooltip__tableRow', className, {
    'echTooltip__tableRow--highlighted': isHighlighted,
    'echTooltip__tableRow--selected': isSelected,
    'echTooltip__tableRow--selectable': isSelectable,
  });

  return (
    // cannot focus row using display: contents to structure grid
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      role="row"
      id={id}
      className={classes}
      onClick={isSelectable ? onSelect : undefined}
      onKeyPress={isSelectable ? onSelect : undefined}
    >
      {children}
    </div>
  );
};
