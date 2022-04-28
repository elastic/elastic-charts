/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-empty-interface */

// linear algebra
type F64 = number; // eventual AssemblyScript compatibility; doesn't hurt with vanilla TS either
type F = F64; // shorthand

/** @internal */
export type Vector2d = Readonly<[F, F, F]>;
/** @internal */
export type Vector3d = Readonly<[F, F, F, F]>;

/** @internal */
export type Matrix2d = [F, F, F, F, F, F, F, F, F];
/** @internal */
export type TransformMatrix2d = Readonly<Matrix2d>;
/** @internal */
export type Matrix3d = [F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F];
/** @internal */
export type TransformMatrix3d = Readonly<Matrix3d>;

/**
 * @internal
 * plain, JSON-bijective value
 */
export type Json = JsonPrimitive | JsonArray | JsonMap;
type JsonPrimitive = null | boolean | number | string;
interface JsonArray extends Array<Json> {}
interface JsonMap {
  [key: string]: Json;
}

/**
 * @internal
 * state object
 */
export type State = JsonMap & WithActionId;

/** @internal */
export type ActionId = number;
interface WithActionId {
  primaryUpdate: { type: string; payload: { uid: ActionId; [propName: string]: Json } };
  [propName: string]: Json; // allow other arbitrary props
}

/**
 * @internal
 * reselect-based data flow
 */
export type PlainFun = (...args: Json[]) => Json;
/** @internal */
export type Selector = (...fns: Resolve[]) => Resolve;
/** @internal */
export type Resolve = (obj: State) => Json;

/** @internal */
export type TypeName = string;
/** @internal */
export type Payload = JsonMap;
/** @internal */
export type UpdaterFunction = (arg: State) => State;

/** @internal */
export type CommitFn = (type: TypeName, payload: Payload) => void;

/** @internal */
export interface Store {
  getCurrentState: () => State;
  setCurrentState: (state: State) => void;
  commit: (type: TypeName, payload: Payload) => void;
}

/** @internal */
export interface Shape {
  id: string;
  type: 'rectangleElement' | 'group';
  subtype: string;
  parent: string | null;
  transformMatrix: TransformMatrix3d;
  a: number;
  b: number;
}
