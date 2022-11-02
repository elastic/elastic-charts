/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { ComponentType, PropsWithChildren, useEffect, useRef, useState } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum } from '../../../specs';
import { TooltipAction, TooltipSpec, TooltipValue } from '../../../specs/tooltip';
import { Datum, renderComplexChildren, renderWithProps } from '../../../utils/common';
import { TooltipDivider } from './tooltip_divider';
import { TooltipPrompt } from './tooltip_prompt';
import { useTooltipContext } from './tooltip_provider';

type TooltipWrapperProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsWithChildren<
  {
    className?: string;
  } & Pick<TooltipSpec<D, SI>, 'actions' | 'actionPrompt' | 'selectionPrompt' | 'actionsLoading' | 'noActionsLoaded'>
>;

/** @internal */
export const TooltipWrapper = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  children,
  className,
  actions,
  actionPrompt,
  selectionPrompt,
  actionsLoading,
  noActionsLoaded,
}: TooltipWrapperProps<D, SI>) => {
  const { dir, pinned, canPinTooltip, selected, pinTooltip, values, theme } = useTooltipContext<D, SI>();

  const syncActions = Array.isArray(actions);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [minWidth, setMinWidth] = useState(0);
  const [loadedActions, setLoadedActions] = useState<TooltipAction<D, SI>[]>(syncActions ? actions : []);

  useEffect(() => {
    // Capture initial unpinned tooltip width
    window.requestAnimationFrame(() => {
      if (tooltipRef.current) {
        const { width } = tooltipRef.current.getBoundingClientRect();
        setMinWidth(width);
      }
    });
  }, []);

  useEffect(() => {
    // Capture pinned tooltip with on change
    if (pinned && tooltipRef.current && minWidth < theme.maxWidth) {
      const { width } = tooltipRef.current.getBoundingClientRect();
      if (width > minWidth) setMinWidth(width);
    }
  }, [selected, pinned, minWidth, theme.maxWidth]);

  useEffect(() => {
    if (pinned && !syncActions) {
      const fetchActions = async (
        asyncActions: (selected: TooltipValue<D, SI>[]) => Promise<TooltipAction<D, SI>[]> | TooltipAction<D, SI>[],
      ) => {
        setLoading(true);
        setLoadedActions(await asyncActions(selected));
        setLoading(false);
      };
      void fetchActions(actions);
      return () => {
        setLoading(true);
        setLoadedActions([]);
      };
    }
  }, [syncActions, actions, selected, pinned]);

  const renderPromptContent = (content: string | ComponentType<{ selected: TooltipValue<D, SI>[] }>) => (
    <div className="echTooltipActions">
      <TooltipDivider />
      <div className="echTooltipActions__prompt">{renderWithProps(content, { selected })}</div>
    </div>
  );

  const renderActions = () => {
    if (!syncActions) {
      if (loading) return renderPromptContent(actionsLoading);
      if (loadedActions.length === 0) return renderPromptContent(noActionsLoaded);
    }

    const visibleActions = loadedActions.filter(({ hide }) => !hide || hide(selected));

    if (visibleActions.length === 0) {
      return <div className="echTooltipPrompt">{selectionPrompt}</div>;
    }

    return [
      <TooltipDivider />,
      ...visibleActions.map(({ onSelect, label, disabled }, i) => {
        const reason = disabled && disabled(selected);

        return (
          <button
            className="echTooltipActions__action"
            key={i}
            title={typeof reason === 'string' ? reason : undefined}
            disabled={Boolean(reason)}
            onClick={() => {
              pinTooltip(false, true);
              // timeout used to close tooltip before calling action
              setTimeout(() => {
                onSelect(selected, values);
              }, 0);
            }}
          >
            {typeof label === 'string' ? label : label(selected)}
          </button>
        );
      }),
    ];
  };

  const key = values.map((d) => `${d.label}`).join('#');

  return (
    <div
      className={classNames('echTooltip', className, {
        'echTooltip--pinned': pinned,
      })}
      dir={dir}
      ref={tooltipRef}
      style={{ minWidth }}
      onClick={(e) => e.stopPropagation()} // block propagation of tooltip click
      onKeyPress={(e) => e.stopPropagation()} // block propagation of tooltip click
    >
      {renderComplexChildren(children)}
      {(pinned && syncActions && loadedActions.length === 0) || !canPinTooltip ? null : pinned ? (
        <div className="echTooltipActions">{renderActions()}</div>
      ) : (
        <TooltipPrompt key={key}>{actionPrompt}</TooltipPrompt>
      )}
    </div>
  );
};
