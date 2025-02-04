/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { ComponentType, useEffect, useState } from 'react';

import { TooltipDivider } from './tooltip_divider';
import { useTooltipContext } from './tooltip_provider';
import { BaseDatum } from '../../../chart_types/specs';
import { SeriesIdentifier } from '../../../common/series_id';
import { TooltipAction, TooltipSpec, TooltipValue } from '../../../specs/tooltip';
import { Datum, renderWithProps } from '../../../utils/common';

/** @internal */
export const TooltipActions = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  actions,
  selectionPrompt,
  actionsLoading,
  noActionsLoaded,
}: Pick<TooltipSpec<D, SI>, 'actions' | 'selectionPrompt' | 'actionsLoading' | 'noActionsLoaded'>) => {
  const { pinned, selected, values, pinTooltip } = useTooltipContext<D, SI>();
  const syncActions = Array.isArray(actions);
  const [loading, setLoading] = useState(true);
  const [loadedActions, setLoadedActions] = useState<TooltipAction<D, SI>[]>(syncActions ? actions : []);

  useEffect(() => {
    if (pinned && !syncActions) {
      const fetchActions = async (
        asyncActions: (s: TooltipValue<D, SI>[]) => Promise<TooltipAction<D, SI>[]> | TooltipAction<D, SI>[],
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

  if (!syncActions) {
    if (loading) return renderPromptContent(actionsLoading, selected);
    if (loadedActions.length === 0) return renderPromptContent(noActionsLoaded, selected);
  }

  if (pinned && syncActions && loadedActions.length === 0) {
    return null;
  }

  const visibleActions = loadedActions.filter(({ hide }) => !hide || hide(selected, values));

  if (visibleActions.length === 0) {
    return renderPromptContent(selectionPrompt, selected);
  }

  return (
    <div className="echTooltipActions">
      <TooltipDivider />
      {...visibleActions.map(({ onSelect, label, disabled }, i) => {
        const reason = disabled && disabled(selected, values);

        return (
          <button
            className="echTooltipActions__action"
            key={`${i}`}
            title={typeof reason === 'string' ? reason : undefined}
            disabled={Boolean(reason)}
            onClick={() => {
              pinTooltip({ pinned: false, resetPointer: true });
              // timeout used to close tooltip before calling action
              setTimeout(() => {
                onSelect(selected, values);
              }, 0);
            }}
          >
            {typeof label === 'string' ? label : label(selected, values)}
          </button>
        );
      })}
    </div>
  );
};

function renderPromptContent<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  content: string | ComponentType<{ selected: TooltipValue<D, SI>[] }>,
  selected: Array<TooltipValue<D, SI>>,
) {
  return (
    <div className="echTooltipActions">
      <TooltipDivider />
      <div className="echTooltipActions__prompt">{renderWithProps(content, { selected })}</div>
    </div>
  );
}
