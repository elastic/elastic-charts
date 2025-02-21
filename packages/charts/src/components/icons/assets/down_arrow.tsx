/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { IconComponentProps } from '../icon';

/** @internal */
export function DownArrowIcon(extraProps: IconComponentProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" {...extraProps}>
      <path d="M 9.199 12.345 L 13.78 5.145 C 14.375 4.21 13.692 3 12.581 3 H 3.419 C 2.308 3 1.625 4.21 2.22 5.146 L 6.801 12.346 A 1.425 1.425 90 0 0 9.199 12.346 Z" />
    </svg>
  );
}
