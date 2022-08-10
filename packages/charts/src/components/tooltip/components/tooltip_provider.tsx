/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PropsWithChildren, Context, useContext } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { onToggleTooltipStick } from '../../../state/actions/tooltip';

interface TooltipContext<SI extends SeriesIdentifier = SeriesIdentifier> {
  backgroundColor: string;
  dir: 'rtl' | 'ltr';
  stuck: boolean;
  selected: SI[];
  toggleStuck: typeof onToggleTooltipStick;
}

const TooltipContext = React.createContext<TooltipContext>({
  backgroundColor: '#fff',
  dir: 'ltr',
  stuck: false,
  selected: [],
  toggleStuck: onToggleTooltipStick,
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
  stuck,
  selected,
  toggleStuck,
  children,
}: TooltipProviderProps) => {
  return (
    <TooltipContext.Provider
      value={{
        backgroundColor,
        dir,
        stuck,
        selected,
        toggleStuck,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};
