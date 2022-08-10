/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { TooltipAction } from '../../../specs/tooltip';
import { renderComplexChildren } from '../../../utils/common';
import { useTooltipContext } from './tooltip_provider';

type TooltipWrapperProps<SI extends SeriesIdentifier = SeriesIdentifier> = PropsWithChildren<{
  className?: string;
  actions: TooltipAction<SI>[];
}>;

/** @internal */
export const TooltipWrapper = <SI extends SeriesIdentifier = SeriesIdentifier>({
  children,
  actions,
  className,
}: TooltipWrapperProps<SI>) => {
  const { dir, stuck, selected, toggleStuck } = useTooltipContext<SI>();

  return (
    <div
      className={classNames('echTooltip', className, {
        'echTooltip--stuck': stuck,
      })}
      dir={dir}
      // onClick={(e) => {
      //   e.stopPropagation();
      //   console.log('clicked');
      // }}
    >
      {renderComplexChildren(children)}
      {actions.length > 0 && (
        <div className="echTooltip__actions">
          {stuck ? (
            actions
              .filter(({ hide }) => !hide || hide(selected))
              .map(({ onSelect, label }, i) => (
                <div className="echTooltip__action" key={i} onClick={() => onSelect(selected, toggleStuck)}>
                  {label(selected)}
                </div>
              ))
          ) : (
            <div className="echTooltip__prompt">Right click to stick tooltip</div>
          )}
        </div>
      )}
    </div>
  );
};
