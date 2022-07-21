/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PropsWithChildren, useContext } from 'react';

interface TooltipContext {
  backgroundColor: string;
  dir: 'rtl' | 'ltr';
}

const TooltipContext = React.createContext<TooltipContext>({
  backgroundColor: '#fff',
  dir: 'ltr',
});

/** @internal */
export const useTooltipContext = () => useContext(TooltipContext);

type TooltipProviderProps = PropsWithChildren<TooltipContext>;

/** @internal */
export const TooltipProvider = ({ backgroundColor, dir, children }: TooltipProviderProps) => {
  return (
    <TooltipContext.Provider
      value={{
        backgroundColor,
        dir,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};
