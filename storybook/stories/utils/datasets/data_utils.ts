/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export function countBy(array: unknown[], by: (arrayValue: unknown) => unknown) {
  return [
    ...array.reduce<Map<unknown, number>>((count, current) => {
      const currentValue = by(current);
      const value = count.get(currentValue);
      count.set(currentValue, (value ?? 0) + 1);
      return count;
    }, new Map()),
  ];
}
