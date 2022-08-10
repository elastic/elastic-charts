/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PropsWithChildren, useContext } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';

interface TooltipContext {
  backgroundColor: string;
  dir: 'rtl' | 'ltr';
  stuck: boolean;
  selected: SeriesIdentifier[];
}

const TooltipContext = React.createContext<TooltipContext>({
  backgroundColor: '#fff',
  dir: 'ltr',
  stuck: false,
  selected: [],
});

/** @internal */
export const useTooltipContext = () => useContext(TooltipContext);

type TooltipProviderProps = PropsWithChildren<TooltipContext>;

/** @internal */
export const TooltipProvider = ({ backgroundColor, dir, stuck, selected, children }: TooltipProviderProps) => {
  return (
    <TooltipContext.Provider
      value={{
        backgroundColor,
        dir,
        stuck,
        selected,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};
