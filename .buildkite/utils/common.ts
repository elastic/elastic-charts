/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Returns a finite number or null
 */
export function getNumber(value?: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}
