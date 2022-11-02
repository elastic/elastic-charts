/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum } from '../../../specs';
import { TooltipSpec } from '../../../specs/tooltip';
import { Datum, renderComplexChildren } from '../../../utils/common';
import { TooltipActions } from './tooltip_actions';
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
  const { dir, pinned, canPinTooltip, selected, theme } = useTooltipContext<D, SI>();

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [minWidth, setMinWidth] = useState(0);

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

  return (
    <div
      className={classNames('echTooltip', className, { 'echTooltip--pinned': pinned })}
      dir={dir}
      ref={tooltipRef}
      style={{ minWidth }}
      onClick={(e) => e.stopPropagation()} // block propagation of tooltip click
      onKeyPress={(e) => e.stopPropagation()} // block propagation of tooltip click
    >
      {renderComplexChildren(children)}
      {!canPinTooltip ? null : pinned ? (
        <TooltipActions
          actions={actions}
          actionsLoading={actionsLoading}
          noActionsLoaded={noActionsLoaded}
          selectionPrompt={selectionPrompt}
        />
      ) : (
        <TooltipPrompt>{actionPrompt}</TooltipPrompt>
      )}
    </div>
  );
};
