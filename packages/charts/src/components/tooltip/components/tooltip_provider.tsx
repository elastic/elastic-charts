/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PropsWithChildren, Context, useContext } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { onTooltipPinned as onTooltipPinnedAction } from '../../../state/actions/tooltip';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { TooltipStyle } from '../../../utils/themes/theme';

interface TooltipContext<SI extends SeriesIdentifier = SeriesIdentifier> {
  backgroundColor: string;
  dir: 'rtl' | 'ltr';
  pinned: boolean;
  selected: SI[];
  onTooltipPinned: typeof onTooltipPinnedAction | ((...args: Parameters<typeof onTooltipPinnedAction>) => void);
  theme: TooltipStyle;
}

const TooltipContext = React.createContext<TooltipContext>({
  backgroundColor: '#fff',
  dir: 'ltr',
  pinned: false,
  selected: [],
  onTooltipPinned: onTooltipPinnedAction,
  theme: LIGHT_THEME.tooltip,
});

/** @internal */
export const useTooltipContext = <SI extends SeriesIdentifier = SeriesIdentifier>() =>
  // cannot predetermine generic type of SI but initial value is always an empty array
  useContext<TooltipContext<SI>>(TooltipContext as unknown as Context<TooltipContext<SI>>);

type TooltipProviderProps = PropsWithChildren<TooltipContext>;

/** @internal */
export const TooltipProvider = ({
  backgroundColor,
  dir,
  pinned,
  selected,
  onTooltipPinned,
  children,
  theme,
}: TooltipProviderProps) => {
  return (
    <TooltipContext.Provider
      value={{
        backgroundColor,
        dir,
        pinned,
        selected,
        onTooltipPinned,
        theme,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};
