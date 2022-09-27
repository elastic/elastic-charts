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
import { BaseDatum } from '../../../specs';
import { TooltipAction } from '../../../specs/tooltip';
import { Datum, renderComplexChildren } from '../../../utils/common';
import { useTooltipContext } from './tooltip_provider';

type TooltipWrapperProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsWithChildren<{
  className?: string;
  actions?: TooltipAction<D, SI>[];
  actionPrompt?: string;
  selectionPrompt?: string;
}>;

/** @internal */
export const TooltipWrapper = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  children,
  actions = [],
  actionPrompt,
  selectionPrompt,
  className,
}: TooltipWrapperProps<D, SI>) => {
  const { dir, pinned, selected, onTooltipPinned, values } = useTooltipContext<D, SI>();

  const renderActions = () => {
    const visibleActions = actions.filter(({ hide }) => !hide || hide(selected));

    if (visibleActions.length === 0) {
      return <div className="echTooltip__prompt">{selectionPrompt}</div>;
    }

    return visibleActions.map(({ onSelect, label, disabled }, i) => {
      const reason = disabled && disabled(selected);

      return (
        <button
          className="echTooltip__action"
          key={i}
          title={typeof reason === 'string' ? reason : undefined}
          disabled={Boolean(reason)}
          onClick={() => {
            onTooltipPinned(false, true);
            // timeout used to close tooltip before calling action
            setTimeout(() => {
              onSelect(selected, values);
            }, 0);
          }}
        >
          {label(selected)}
        </button>
      );
    });
  };

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
          {pinned ? renderActions() : <div className="echTooltip__prompt">{actionPrompt}</div>}
        </div>
      )}
    </div>
  );
};
