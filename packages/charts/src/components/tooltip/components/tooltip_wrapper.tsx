/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { AriaRole, PropsWithChildren } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { TooltipActions } from './tooltip_actions';
import { TooltipPrompt } from './tooltip_prompt';
import { useTooltipContext } from './tooltip_provider';
import type { SeriesIdentifier } from '../../../common/series_id';
import type { BaseDatum } from '../../../specs';
import type { TooltipSpec } from '../../../specs/tooltip';
import type { Datum } from '../../../utils/common';

type TooltipWrapperProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsWithChildren<
  {
    className?: string;
    id?: string;
    role?: AriaRole;
  } & Pick<
    TooltipSpec<D, SI>,
    'actions' | 'actionPrompt' | 'pinningPrompt' | 'selectionPrompt' | 'actionsLoading' | 'noActionsLoaded'
  >
>;

/** @internal */
export const TooltipWrapper = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  children,
  className,
  id,
  role,
  actions,
  actionPrompt,
  pinningPrompt,
  selectionPrompt,
  actionsLoading,
  noActionsLoaded,
}: TooltipWrapperProps<D, SI>) => {
  const { dir, pinned, canPinTooltip, selected, values, theme, actionable } = useTooltipContext<D, SI>();

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const unpinnedWidth = useRef(0);
  const [minWidth, setMinWidth] = useState(0);

  useEffect(() => {
    // Capture the unpinned tooltip width every time its content changes
    if (pinned) return;
    const frame = window.requestAnimationFrame(() => {
      if (tooltipRef.current) {
        unpinnedWidth.current = tooltipRef.current.getBoundingClientRect().width;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pinned, values]);

  useLayoutEffect(() => {
    // Prevent the tooltip from shrinking when pinned, without constraining the unpinned tooltip
    setMinWidth(pinned ? unpinnedWidth.current : 0);
  }, [pinned]);

  useEffect(() => {
    // Capture pinned tooltip with on change
    if (pinned && tooltipRef.current && typeof theme.maxWidth === 'number' && minWidth < theme.maxWidth) {
      const { width } = tooltipRef.current.getBoundingClientRect();
      if (width > minWidth) setMinWidth((prev) => Math.max(prev, width));
    }
  }, [selected, pinned, minWidth, theme.maxWidth]);

  return (
    <div
      id={id}
      role={role}
      className={classNames('echTooltip', className, { 'echTooltip--pinned': pinned })}
      data-testid="echTooltip"
      dir={dir}
      ref={tooltipRef}
      style={{ minWidth: pinned ? minWidth : undefined }}
      onClick={(e) => e.stopPropagation()} // block propagation of tooltip click
      onKeyPress={(e) => e.stopPropagation()} // block propagation of tooltip click
    >
      {children}
      {!canPinTooltip ? null : pinned ? (
        <TooltipActions
          actions={actions}
          actionsLoading={actionsLoading}
          noActionsLoaded={noActionsLoaded}
          selectionPrompt={selectionPrompt}
        />
      ) : (
        <TooltipPrompt>{actionable ? actionPrompt : pinningPrompt}</TooltipPrompt>
      )}
    </div>
  );
};
