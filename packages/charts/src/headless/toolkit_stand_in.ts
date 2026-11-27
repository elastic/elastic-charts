/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Draft } from 'immer';
import { produce } from 'immer';

/**
 * Stands in for `@reduxjs/toolkit`, and so for redux, in the headless file of the build for Node: the part that
 * the chart uses. A store holds a state and gives each action to one reducer; a slice makes that reducer from
 * the cases that were added for action types, each of which writes to an immer draft of the state. There is no
 * middleware and there are no developer tools.
 */

interface Action {
  type: string;
}

type Reducer<State> = (state: State | undefined, action: Action) => State;

type CaseReducer<State> = (draft: Draft<State>, action: any) => Draft<State> | void;

interface CaseBuilder<State> {
  addCase: (actionCreator: Action | string, reducer: CaseReducer<State>) => CaseBuilder<State>;
}

/** @internal */
export { isDraft, original, produce as createNextState } from 'immer';

/** @internal */
export function createAction(type: string, prepare?: (...args: any[]) => object) {
  const actionCreator = (...args: unknown[]) => (prepare ? { type, ...prepare(...args) } : { type, payload: args[0] });
  actionCreator.type = type;
  actionCreator.toString = () => type;
  actionCreator.match = (action: Action) => action.type === type;
  return actionCreator;
}

/** @internal */
export function createSlice<State>(slice: {
  initialState: State;
  extraReducers: (builder: CaseBuilder<State>) => void;
}) {
  const cases = new Map<string, CaseReducer<State>>();
  const builder: CaseBuilder<State> = {
    addCase(actionCreator, reducer) {
      const type = typeof actionCreator === 'string' ? actionCreator : actionCreator.type;
      if (cases.has(type)) throw new Error(`Two reducers for the action type ${type}`);
      cases.set(type, reducer);
      return builder;
    },
  };
  slice.extraReducers(builder);
  // as every later state, the first one is frozen
  const initialState = produce(slice.initialState, () => {});
  const reducer: Reducer<State> = (given, action) => {
    const state = given ?? initialState;
    const caseReducer = cases.get(action.type);
    return caseReducer ? produce(state, (draft) => caseReducer(draft, action)) : state;
  };
  return { reducer };
}

/** @internal */
export function configureStore<State>({ reducer }: { reducer: Reducer<State> }) {
  let state = reducer(undefined, { type: '@@INIT' });
  let reducing = false;
  let lastListener = 0;
  const listeners = new Map<number, () => void>();
  return {
    getState: () => state,
    dispatch<A extends Action>(action: A): A {
      if (reducing) throw new Error('A reducer may not dispatch an action');
      reducing = true;
      try {
        state = reducer(state, action);
      } finally {
        reducing = false;
      }
      // those that were subscribed when the action came, even if one of them unsubscribes another
      for (const listener of [...listeners.values()]) listener();
      return action;
    },
    subscribe(listener: () => void) {
      const id = lastListener++;
      listeners.set(id, listener);
      return () => {
        listeners.delete(id);
      };
    },
  };
}

type ActionCreator = (...args: any[]) => Action;

/** @internal */
export function bindActionCreators<Creators extends Record<string, ActionCreator>>(
  actionCreators: Creators,
  dispatch: (action: Action) => unknown,
) {
  const bound: Record<string, (...args: unknown[]) => unknown> = {};
  for (const [name, actionCreator] of Object.entries(actionCreators)) {
    bound[name] = (...args) => dispatch(actionCreator(...args));
  }
  return bound as { [Name in keyof Creators]: (...args: Parameters<Creators[Name]>) => ReturnType<Creators[Name]> };
}
