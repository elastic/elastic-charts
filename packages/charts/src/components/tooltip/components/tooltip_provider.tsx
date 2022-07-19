/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PropsWithChildren, useContext, useState } from 'react';
import { Optional } from 'utility-types';

interface TooltipContext {
  backgroundColor: string;
  dir: 'rtl' | 'ltr';
  hideColor: boolean;
}

type MutableContextKeys = Extract<keyof TooltipContext, 'hideColor'>;
type UpdateContextValuesFn = (values: Partial<Pick<TooltipContext, MutableContextKeys>>) => void;

const TooltipContext = React.createContext<TooltipContext & { updateValues: UpdateContextValuesFn }>({
  backgroundColor: '#fff',
  dir: 'ltr',
  hideColor: false,
  updateValues: () => {},
});

/** @internal */
export const useTooltipContext = () => useContext(TooltipContext);

type TooltipTableBodyProps = Optional<PropsWithChildren<TooltipContext>, 'hideColor'>;

/** @internal */
export const TooltipProvider = ({ backgroundColor, dir, hideColor = false, children }: TooltipTableBodyProps) => {
  const [value, setValue] = useState({
    backgroundColor,
    dir,
    hideColor,
  });

  const updateValues: UpdateContextValuesFn = (newValues) => {
    setValue((oldValues) => {
      return {
        ...oldValues,
        ...newValues,
      };
    });
  };

  return <TooltipContext.Provider value={{ ...value, updateValues }}>{children}</TooltipContext.Provider>;
};
