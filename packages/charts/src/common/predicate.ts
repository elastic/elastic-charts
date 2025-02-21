/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

/** @public */
export const Predicate = Object.freeze({
  NumAsc: 'numAsc' as const,
  NumDesc: 'numDesc' as const,
  AlphaAsc: 'alphaAsc' as const,
  AlphaDesc: 'alphaDesc' as const,
  DataIndex: 'dataIndex' as const,
});

/** @public */
export type Predicate = $Values<typeof Predicate>;

/** @internal */
export function getPredicateFn<T>(predicate: Predicate, locale: string, accessor?: keyof T): (a: T, b: T) => number {
  switch (predicate) {
    case 'alphaAsc':
      return (a: T, b: T) => {
        const aValue = String(accessor ? a[accessor] : a);
        const bValue = String(accessor ? b[accessor] : b);
        return aValue.localeCompare(bValue, locale);
      };
    case 'alphaDesc':
      return (a: T, b: T) => {
        const aValue = String(accessor ? a[accessor] : a);
        const bValue = String(accessor ? b[accessor] : b);
        return bValue.localeCompare(aValue, locale);
      };
    case 'numDesc':
      return (a: T, b: T) => {
        const aValue = Number(accessor ? a[accessor] : a);
        const bValue = Number(accessor ? b[accessor] : b);
        return bValue - aValue;
      };
    case 'numAsc':
      return (a: T, b: T) => {
        const aValue = Number(accessor ? a[accessor] : a);
        const bValue = Number(accessor ? b[accessor] : b);
        return aValue - bValue;
      };
    case 'dataIndex':
      return () => 0;
  }
}

/** @internal */
export const hasKey = <T extends Record<string, unknown>>(obj: T, key: string): key is string & keyof T =>
  obj.hasOwnProperty(key);
