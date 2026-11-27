/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// SPIKE: the part of the `react` API that a render-once, markup-only pass of Charts needs.
// No reconciler, no scheduler, no effects: state is its initial value, an effect never runs.

export const ELEMENT = Symbol.for('react.element');
export const Fragment = Symbol.for('react.fragment');
export const Suspense = Symbol.for('react.suspense');
export const StrictMode = Symbol.for('react.strict_mode');
export const PROVIDER = Symbol.for('react.provider');
export const CONTEXT = Symbol.for('react.context');
export const MEMO = Symbol.for('react.memo');
export const FORWARD_REF = Symbol.for('react.forward_ref');

const noop = () => {};

export function createElement(type: any, config?: any, ...children: any[]) {
  const props: any = {};
  let key = null;
  let ref = null;
  if (config != null) {
    for (const name in config) {
      if (!Object.prototype.hasOwnProperty.call(config, name)) continue;
      if (name === 'key') key = `${config.key}`;
      else if (name === 'ref') ({ ref } = config);
      else if (name !== '__self' && name !== '__source') props[name] = config[name];
    }
  }
  if (children.length === 1) props.children = children[0];
  else if (children.length > 1) props.children = children;
  const defaults = type?.defaultProps;
  if (defaults) for (const name in defaults) if (props[name] === undefined) props[name] = defaults[name];
  return { $$typeof: ELEMENT, type, key, ref, props };
}

export const isValidElement = (o: any) => typeof o === 'object' && o !== null && o.$$typeof === ELEMENT;

export function cloneElement(element: any, config?: any, ...children: any[]) {
  const props: any = { ...element.props };
  let { key, ref } = element;
  if (config != null) {
    const defaults = element.type?.defaultProps;
    for (const name in config) {
      if (!Object.prototype.hasOwnProperty.call(config, name)) continue;
      if (name === 'key') key = `${config.key}`;
      else if (name === 'ref') ({ ref } = config);
      else props[name] = config[name] === undefined && defaults ? defaults[name] : config[name];
    }
  }
  if (children.length === 1) props.children = children[0];
  else if (children.length > 1) props.children = children;
  return { $$typeof: ELEMENT, type: element.type, key, ref, props };
}

export class Component<P = any, S = any> {
  props: P;
  context: any;
  state!: S;
  constructor(props: P, context?: any) {
    this.props = props;
    this.context = context;
  }

  setState() {}

  forceUpdate() {}

  render(): any {
    return null;
  }
}
(Component.prototype as any).isReactComponent = {};
export class PureComponent<P = any, S = any> extends Component<P, S> {}

export function createContext(defaultValue?: any) {
  const context: any = { $$typeof: CONTEXT, current: defaultValue };
  context.Provider = { $$typeof: PROVIDER, context };
  context.Consumer = context;
  return context;
}

export const useContext = (context: any) => context.current;
export const useState = (initial?: any) => [typeof initial === 'function' ? initial() : initial, noop];
export const useReducer = (_: any, arg: any, init?: any) => [init ? init(arg) : arg, noop];
export const useRef = (current?: any) => ({ current });
export const createRef = () => ({ current: null });
export const useMemo = (make: () => any) => make();
export const useCallback = (fn: any) => fn;
export const useEffect = noop;
export const useLayoutEffect = noop;
export const useInsertionEffect = noop;
export const useImperativeHandle = noop;
export const useDebugValue = noop;
export const useSyncExternalStore = (_: any, get: () => any, getServer?: () => any) => (getServer ?? get)();
let ids = 0;
export const useId = () => `:r${ids++}:`;

export const memo = (type: any) => ({ $$typeof: MEMO, type });
export const forwardRef = (render: any) => ({ $$typeof: FORWARD_REF, render });
export const Children = {
  toArray: (children: any): any[] =>
    (Array.isArray(children) ? children.flat(Infinity) : [children]).filter((c) => c != null && typeof c !== 'boolean'),
  count: (children: any) => Children.toArray(children).length,
  map: (children: any, fn: any) => (children == null ? children : Children.toArray(children).map(fn)),
  forEach: (children: any, fn: any) => Children.toArray(children).forEach(fn),
  only: (children: any) => children,
};
export const version = '18.3.1-static-shim';

const React = {
  Children,
  Component,
  Fragment,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  memo,
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  version,
};
export default React;
