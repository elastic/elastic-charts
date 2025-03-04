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
export function EmptyIcon(extraProps: IconComponentProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" {...extraProps} />;
}
