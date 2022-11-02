/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

interface MappedTouch {
  id: number;
  position: number;
}

/** @internal */
export type Multitouch = MappedTouch[];

/** @internal */
export const initialMultitouch = (): Multitouch => [];

/** @internal */
export const touchMidpoint = (multitouch: MappedTouch[]) =>
  multitouch.reduce((sum, { position }) => sum + position, 0) / multitouch.length;

const isNonNull = <T>(thing: T | null): thing is T => thing !== null;

/** @internal */
export const touches = (e: TouchEvent) =>
  [...new Array(e.touches?.length ?? 0)]
    .map((_, i: number) => e.touches.item(i))
    .filter(isNonNull)
    .map((t: Touch) => ({ id: t.identifier, position: t.clientX }))
    .sort(({ position: a }, { position: b }) => a - b);

/** @internal */
export const continuedTwoPointTouch = (multitouch: MappedTouch[], newMultitouch: MappedTouch[]) =>
  [...newMultitouch, ...multitouch].filter((t, i, a) => a.findIndex((tt) => tt.id === t.id) === i).length === 2;

/** @internal */
export const setNewMultitouch = (multitouch: MappedTouch[], newMultitouch: MappedTouch[]) =>
  multitouch.splice(0, Infinity, ...newMultitouch);

/** @internal */
export const eraseMultitouch = (multitouch: MappedTouch[]) => multitouch.splice(0, Infinity);

/** @internal */
export const getPinchRatio = (multitouch: MappedTouch[], newMultitouch: MappedTouch[]) =>
  (multitouch[1].position - multitouch[0].position) / (newMultitouch[1].position - newMultitouch[0].position);

/** @internal */
export const twoTouchPinch = (multitouch: MappedTouch[]) => multitouch.length === 2;

/** @internal */
export const zeroTouch = (multitouch: MappedTouch[]) => multitouch.length === 0;
