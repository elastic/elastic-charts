/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

type Group<T> = Record<string, T[]>;

/** @public */
export type GroupByKeyFn<T> = (data: T) => string;

/** @public */
export type GroupKeysOrKeyFn<T> = Array<keyof T> | GroupByKeyFn<T>;

/** @internal */
export function groupBy<T>(data: T[], keysOrKeyFn: GroupKeysOrKeyFn<T>, asArray: false): Group<T>;
/** @internal */
export function groupBy<T>(data: T[], keysOrKeyFn: GroupKeysOrKeyFn<T>, asArray: true): T[][];
/** @internal */
export function groupBy<T>(data: T[], keysOrKeyFn: GroupKeysOrKeyFn<T>, asArray: boolean): T[][] | Group<T> {
  const keyFn = Array.isArray(keysOrKeyFn) ? getUniqueKey(keysOrKeyFn) : keysOrKeyFn;
  const grouped = data.reduce<Group<T>>((acc, curr) => {
    const key = keyFn(curr);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});
  return asArray ? Object.values(grouped) : grouped;
}

/** @internal */
export function getUniqueKey<T>(keys: Array<keyof T>, concat = '|') {
  return (data: T): string => {
    return keys
      .map((key) => {
        return data[key];
      })
      .join(concat);
  };
}
