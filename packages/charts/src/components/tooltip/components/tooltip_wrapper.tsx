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
  actions?: TooltipAction<SI>[];
}>;

/** @internal */
export const TooltipWrapper = <SI extends SeriesIdentifier = SeriesIdentifier>({
  children,
  actions = [],
  className,
}: TooltipWrapperProps<SI>) => {
  const { dir, pinned, selected, tooltipPinned } = useTooltipContext<SI>();

  return (
    <div
      className={classNames('echTooltip', className, {
        'echTooltip--pinned': pinned,
      })}
      dir={dir}
      onClick={(e) => {
        e.stopPropagation(); // block propagation of tooltip click
      }}
    >
      {renderComplexChildren(children)}
      {actions.length > 0 && (
        <div className="echTooltip__actions">
          {pinned ? (
            actions
              .filter(({ hide }) => !hide || hide(selected))
              .map(({ onSelect, label }, i) => (
                <div
                  className="echTooltip__action"
                  key={i}
                  onClick={() => {
                    tooltipPinned(false);
                    // timeout used to close tooltip before calling action
                    setTimeout(onSelect, 0, selected);
                  }}
                >
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
