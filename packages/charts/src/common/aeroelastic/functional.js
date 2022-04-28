/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * @internal flatten
 *
 * Flattens an array of arrays into an array
 *
 * @param {*[][]} arrays
 * @returns *[]
 * @internal
 */
export const flatten = (arrays) => [].concat(...arrays);

/**
 * @internal identity
 *
 * @param d
 * @returns d
 */
export const identity = (d) => d;

/**
 * @internal map
 *
 * Maps a function over an array
 *
 * Passing the index and the array are avoided
 *
 * @param {Function} fun
 * @returns {function(*): *}
 */
export const map = (fun) => (array) => array.map((value) => fun(value));

/**
 * @internal disjunctiveUnion
 *
 * @param {Function} keyFun
 * @param {*[]} set1
 * @param {*[]} set2
 * @returns *[]
 */
export const disjunctiveUnion = (keyFun, set1, set2) =>
  set1
    .filter((s1) => !set2.some((s2) => keyFun(s2) === keyFun(s1)))
    .concat(set2.filter((s2) => !set1.some((s1) => keyFun(s1) === keyFun(s2))));

/**
 * @internal mean
 * @param {number} a
 * @param {number} b
 * @returns {number} the mean of the two parameters
 */
export const mean = (a, b) => (a + b) / 2;

/** @internal */
export const shallowEqual = (a, b) =>
  Object.is(a, b) ||
  (Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((key) => Object.is(a[key], b[key])));

/** @internal */
export const not = (fun) => (...args) => !fun(...args);

/** @internal */
export const removeDuplicates = (idFun, a) => a.filter((d, i) => a.findIndex((s) => idFun(s) === idFun(d)) === i);

/** @internal */
export const arrayToMap = (a) => Object.assign({}, ...a.map((d) => ({ [d]: true })));

/** @internal */
export const subMultitree = (pk, fk, elements, inputRoots) => {
  const getSubgraphs = (roots) => {
    const children = flatten(roots.map((r) => elements.filter((e) => fk(e) === pk(r))));
    return children.length > 0 ? [...roots, ...getSubgraphs(children, elements)] : roots;
  };
  return getSubgraphs(inputRoots);
};
