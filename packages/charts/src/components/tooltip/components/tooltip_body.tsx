/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { TooltipValueFormatter, BaseDatum, TooltipSpec, TooltipProps, TooltipAction } from '../../../specs';
import { onTooltipItemSelected } from '../../../state/actions/tooltip';
import { Datum } from '../../../utils/common';
import { TooltipInfo } from '../types';
import { TooltipFooter } from './tooltip_footer';
import { TooltipHeader } from './tooltip_header';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTable } from './tooltip_table';
import { TooltipWrapper } from './tooltip_wrapper';
import { TooltipTableColumn } from './types';

interface TooltipBodyProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>
  extends Pick<TooltipSpec<D, SI>, 'headerFormatter' | 'header' | 'footer'> {
  visible: boolean;
  info?: TooltipInfo<D, SI>;
  columns: TooltipTableColumn<D, SI>[];
  headerFormatter?: TooltipValueFormatter<D, SI>;
  settings?: TooltipProps<D, SI>;
  actions: TooltipAction<SI>[];
  onSelect: typeof onTooltipItemSelected;
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
  actions,
  onSelect,
}: TooltipBodyProps<D, SI>) => {
  const { backgroundColor, dir, pinned, selected } = useTooltipContext();
  if (!info || !visible) {
    return null;
  }

  if (typeof settings !== 'string' && settings?.customTooltip) {
    const CustomTooltip = settings.customTooltip;
    return (
      <TooltipWrapper actions={actions}>
        <CustomTooltip {...info} headerFormatter={headerFormatter} backgroundColor={backgroundColor} dir={dir} />
      </TooltipWrapper>
    );
  }

  return (
    <TooltipWrapper actions={actions}>
      {header ? (
        <TooltipHeader>{typeof header === 'string' ? header : header(info.values)}</TooltipHeader>
      ) : (
        <TooltipHeader header={info.header} formatter={headerFormatter} />
      )}
      <TooltipTable columns={columns} items={info.values} pinned={pinned} onSelect={onSelect} selected={selected} />
      {footer && <TooltipFooter>{typeof footer === 'string' ? footer : footer(info.values)}</TooltipFooter>}
    </TooltipWrapper>
  );
};
