/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PropsWithChildren, Context, useContext } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { pinTooltip as pinTooltipAction } from '../../../state/actions/tooltip';
import { Datum } from '../../../utils/common';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { TooltipStyle } from '../../../utils/themes/theme';
import { CustomTooltipProps, PinTooltipCallback } from '../types';

interface TooltipContext<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
  theme: TooltipStyle;
  backgroundColor: string;
  dir: 'rtl' | 'ltr';
  maxItems: number;
  actionable: boolean;
  pinned: boolean;
  canPinTooltip: boolean;
  pinTooltip: PinTooltipCallback;
  values: TooltipValue<D, SI>[];
  selected: Array<TooltipValue<D, SI>>;
  toggleSelected: CustomTooltipProps['toggleSelected'];
  setSelection: CustomTooltipProps['setSelection'];
}

const TooltipContext = React.createContext<TooltipContext>({
  backgroundColor: '#fff',
  dir: 'ltr',
  maxItems: 5,
  pinned: false,
  actionable: false,
  canPinTooltip: false,
  selected: [],
  toggleSelected: () => {},
  setSelection: () => {},
  values: [],
  pinTooltip: pinTooltipAction,
  theme: LIGHT_THEME.tooltip,
});

/** @public */
export const useTooltipContext = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>() =>
  useContext<TooltipContext<D, SI>>(TooltipContext as unknown as Context<TooltipContext<D, SI>>);

type TooltipProviderProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsWithChildren<TooltipContext<D, SI>>;

/** @internal */
export const TooltipProvider = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  children,
  ...rest
}: TooltipProviderProps<D, SI>) => {
  return <TooltipContext.Provider value={rest}>{children}</TooltipContext.Provider>;
};
