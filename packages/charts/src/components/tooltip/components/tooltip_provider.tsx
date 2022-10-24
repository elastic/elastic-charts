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
import { PinTooltipCallback } from '../types';

interface TooltipContext<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
  backgroundColor: string;
  dir: 'rtl' | 'ltr';
  maxItems: number;
  pinned: boolean;
  actionable: boolean;
  canPinTooltip: boolean;
  selected: Array<TooltipValue<D, SI>>;
  values: TooltipValue<D, SI>[];
  pinTooltip: PinTooltipCallback;
  theme: TooltipStyle;
}

const TooltipContext = React.createContext<TooltipContext>({
  backgroundColor: '#fff',
  dir: 'ltr',
  maxItems: 5,
  pinned: false,
  actionable: false,
  canPinTooltip: false,
  selected: [],
  values: [],
  pinTooltip: pinTooltipAction,
  theme: LIGHT_THEME.tooltip,
});

/** @internal */
export const useTooltipContext = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>() =>
  useContext<TooltipContext<D, SI>>(TooltipContext as unknown as Context<TooltipContext<D, SI>>);

type TooltipProviderProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsWithChildren<TooltipContext<D, SI>>;

/** @internal */
export const TooltipProvider = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  backgroundColor,
  dir,
  maxItems,
  pinned,
  actionable,
  canPinTooltip,
  selected,
  values,
  pinTooltip,
  children,
  theme,
}: TooltipProviderProps<D, SI>) => {
  return (
    <TooltipContext.Provider
      value={{
        backgroundColor,
        dir,
        maxItems,
        pinned,
        actionable,
        canPinTooltip,
        selected,
        values,
        pinTooltip,
        theme,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};
