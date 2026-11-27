/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// SPIKE: `react-redux` for a render-once pass: a component reads the store when it renders, never again.
import { createContext, createElement, useContext } from './react';

export const ReactReduxContext = createContext(null);

export const Provider = ({ store, children }: any) =>
  createElement(ReactReduxContext.Provider, { value: store }, children);
export const useStore = () => useContext(ReactReduxContext);
export const useDispatch = () => useContext(ReactReduxContext).dispatch;
export const useSelector = (selector: any) => selector(useContext(ReactReduxContext).getState());

export const connect = (mapState?: any, mapDispatch?: any) => (Wrapped: any) => {
  const Connected = (own: any) => {
    const store = useContext(ReactReduxContext);
    const fromState = mapState ? mapState(store.getState(), own) : {};
    const fromDispatch =
      typeof mapDispatch === 'function'
        ? mapDispatch(store.dispatch, own)
        : mapDispatch
          ? Object.fromEntries(
              Object.entries(mapDispatch).map(([k, make]: any) => [k, (...a: any[]) => store.dispatch(make(...a))]),
            )
          : { dispatch: store.dispatch };
    return createElement(Wrapped, { ...own, ...fromState, ...fromDispatch });
  };
  Connected.displayName = `Connect(${Wrapped.displayName ?? Wrapped.name ?? 'Component'})`;
  return Connected;
};
