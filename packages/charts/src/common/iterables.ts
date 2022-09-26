/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// just like [].map except on iterables, to avoid having to materialize both input and output arrays
/** @internal */
export function map<InElem, OutElem>(fun: (arg: InElem, index: number) => OutElem, iterable: Iterable<InElem>) {
  let i = 0;
  return (function* mapGenerator() {
    for (const next of iterable) yield fun(next, i++);
  })();
}

/** @internal */
export function filter<Elem>(fun: (arg: Elem, index: number) => boolean, iterable: Iterable<Elem>) {
  let i = 0;
  return (function* mapGenerator() {
    for (const next of iterable) {
      if (fun(next, i++)) yield next;
    }
  })();
}
