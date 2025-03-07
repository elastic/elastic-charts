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
export function ListIcon(extraProps: IconComponentProps) {
  return (
    <svg width={16} height={16} xmlns="http://www.w3.org/2000/svg" {...extraProps}>
      <path d="M2 4V3h2v1H2zm4 0V3h8v1H6zm0 3V6h8v1H6zm0 3V9h8v1H6zM2 7V6h2v1H2zm0 3V9h2v1H2zm4 3v-1h8v1H6zm-4 0v-1h2v1H2z" />
    </svg>
  );
}
