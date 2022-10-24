/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Placement as PopperPlacement } from '@popperjs/core';
import React, { CSSProperties } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { TooltipValueFormatter, BaseDatum, TooltipSpec, TooltipProps } from '../../../specs';
import { Datum } from '../../../utils/common';
import { SetSelectedTooltipItemsCallback, ToggleSelectedTooltipItemCallback, TooltipInfo } from '../types';
import { TooltipFooter } from './tooltip_footer';
import { TooltipHeader } from './tooltip_header';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTable } from './tooltip_table';
import { TooltipWrapper } from './tooltip_wrapper';
import { TooltipTableColumn } from './types';

interface TooltipBodyProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>
  extends Pick<
      TooltipSpec<D, SI>,
      'actions' | 'actionPrompt' | 'selectionPrompt' | 'actionsLoading' | 'noActionsLoaded'
    >,
    Pick<TooltipSpec<D, SI>, 'headerFormatter' | 'header' | 'footer' | 'actionPrompt' | 'selectionPrompt'> {
  visible: boolean;
  info?: TooltipInfo<D, SI>;
  placement?: PopperPlacement;
  columns: TooltipTableColumn<D, SI>[];
  headerFormatter?: TooltipValueFormatter<D, SI>;
  settings?: TooltipProps<D, SI>;
  toggleSelected: ToggleSelectedTooltipItemCallback;
  setSelection: SetSelectedTooltipItemsCallback;
}

/** @internal */
export const TooltipBody = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  info,
  visible,
  settings,
  headerFormatter,
  columns,
  header,
  footer,
  placement,
  actions = [],
  toggleSelected,
  setSelection,
  actionPrompt,
  selectionPrompt,
  actionsLoading,
  noActionsLoaded,
}: TooltipBodyProps<D, SI>) => {
  const { backgroundColor, dir, pinned, selected, theme } = useTooltipContext<D, SI>();
  if (!info || !visible) {
    return null;
  }

  const wrapperStyles = getStylesFromPlacement(placement);

  if (typeof settings !== 'string' && settings?.customTooltip) {
    const CustomTooltip = settings.customTooltip;
    return (
      <div className="echTooltip__outerWrapper" style={{ ...wrapperStyles, width: theme.maxWidth }}>
        <TooltipWrapper
          actions={actions}
          actionPrompt={actionPrompt}
          selectionPrompt={selectionPrompt}
          actionsLoading={actionsLoading}
          noActionsLoaded={noActionsLoaded}
        >
          <CustomTooltip
            {...info}
            dir={dir}
            pinned={pinned}
            selected={selected}
            setSelection={setSelection}
            toggleSelected={toggleSelected}
            headerFormatter={headerFormatter}
            backgroundColor={backgroundColor}
          />
        </TooltipWrapper>
      </div>
    );
  }

  return (
    <div className="echTooltip__outerWrapper" style={{ ...wrapperStyles, width: theme.maxWidth }}>
      <TooltipWrapper
        actions={actions}
        actionPrompt={actionPrompt}
        selectionPrompt={selectionPrompt}
        actionsLoading={actionsLoading}
        noActionsLoaded={noActionsLoaded}
      >
        {header ? (
          <TooltipHeader>{typeof header === 'string' ? header : header(info.values)}</TooltipHeader>
        ) : (
          <TooltipHeader header={info.header} formatter={headerFormatter} />
        )}
        <TooltipTable
          columns={columns}
          items={info.values}
          pinned={pinned}
          onSelect={toggleSelected}
          selected={selected}
        />
        {footer && <TooltipFooter>{typeof footer === 'string' ? footer : footer(info.values)}</TooltipFooter>}
      </TooltipWrapper>
    </div>
  );
};

function getStylesFromPlacement(placement?: PopperPlacement): CSSProperties | undefined {
  switch (placement) {
    case 'left':
    case 'left-start':
    case 'left-end':
    case 'top-end':
    case 'bottom-end':
      return {
        justifyContent: 'flex-end',
      };
    case 'right':
    case 'right-start':
    case 'right-end':
    case 'top-start':
    case 'bottom-start':
      return {
        justifyContent: 'flex-start',
      };
    case 'top':
    case 'bottom':
      return {
        justifyContent: 'center',
      };
    case 'auto':
    case 'auto-start':
    case 'auto-end':
    default:
      return undefined;
  }
}
