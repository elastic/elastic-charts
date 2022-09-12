/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export function mapping<InElem, OutElem>(
  fun: (arg: InElem /*, index: number*/) => OutElem,
): (iterable: Iterable<InElem>) => Iterable<OutElem> {
  return function* (iterable: Iterable<InElem>): Iterable<OutElem> {
    // let i = 0;
    for (const next of iterable) yield fun(next /*, i++*/);
  };
}

/** @internal */
export function doing<InElem>(
  fun: (arg: InElem /*, index: number*/) => void,
): (iterable: Iterable<InElem>) => Iterable<never> {
  return function* (iterable: Iterable<InElem>): Iterable<never> {
    // let i = 0;
    for (const next of iterable) fun(next /*, i++*/);
  };
}

/** @internal */
export function filtering<Elem>(
  fun: (arg: Elem /*, index: number*/) => boolean,
): (iterable: Iterable<Elem>) => Iterable<Elem> {
  return function* (iterable: Iterable<Elem>): Iterable<Elem> {
    //let i = 0;
    for (const next of iterable) {
      if (fun(next /*, i++*/)) yield next;
    }
  };
}

// just like [].map except on iterables, to avoid having to materialize both input and output arrays
/** @internal */
export function map<InElem, OutElem>(
  iterable: Iterable<InElem>,
  fun: (arg: InElem /*, index: number*/) => OutElem,
): Iterable<OutElem> {
  return mapping(fun)(iterable);
}

/** @internal */
export function filter<Elem>(
  iterable: Iterable<Elem>,
  fun: (arg: Elem /*, index: number*/) => boolean,
): Iterable<Elem> {
  return filtering(fun)(iterable);
}

/*
/!** @internal *!/
export function finallyDoing<InElem>(
  fun: (arg: InElem /!*, index: number*!/) => void,
): (iterable: Iterable<InElem>) => void {
  return function (iterable: Iterable<InElem>): void {
    // let i = 0;
    for (const next of iterable) fun(next /!*, i++*!/);
  };
}
*/

/** @internal */
export function executing(iterable: Iterable<unknown>): void {
  const iterator = iterable[Symbol.iterator]();
  while (!iterator.next().done) {}
}

/** @internal */
export function pipeline<In>(arg: In): In;

/** @internal */
export function pipeline<In, Out>(arg: In, f1: (x: In) => Out): Out;

/** @internal */
export function pipeline<In, Mid1, Out>(arg: In, f1: (x: In) => Mid1, f2: (x: Mid1) => Out): Out;

/** @internal */
export function pipeline<In, Mid1, Mid2, Out>(
  arg: In,
  f1: (x: In) => Mid1,
  f2: (x: Mid1) => Mid2,
  f3: (x: Mid2) => Out,
): Out;

/** @internal */
export function pipeline<In, Mid1, Mid2, Mid3, Out>(
  arg: In,
  f1: (x: In) => Mid1,
  f2: (x: Mid1) => Mid2,
  f3: (x: Mid2) => Mid3,
  f4: (x: Mid3) => Out,
): Out;

/** @internal */
export function pipeline<In, Mid1, Mid2, Mid3, Mid4, Out>(
  arg: In,
  f1: (x: In) => Mid1,
  f2: (x: Mid1) => Mid2,
  f3: (x: Mid2) => Mid3,
  f4: (x: Mid3) => Mid4,
  f5: (x: Mid4) => Out,
): Out;

/** @internal */
export function pipeline<In, Mid1, Mid2, Mid3, Mid4, Mid5, Out>(
  arg: In,
  f1: (x: In) => Mid1,
  f2: (x: Mid1) => Mid2,
  f3: (x: Mid2) => Mid3,
  f4: (x: Mid3) => Mid4,
  f5: (x: Mid4) => Mid5,
  f6: (x: Mid5) => Out,
): Out;

/** @internal */
export function pipeline(arg: unknown, ...functions: Array<(x: unknown) => unknown>) {
  return functions.reduce((iterator, fun) => fun(iterator), arg);
}
