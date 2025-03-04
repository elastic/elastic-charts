/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CSSProperties } from 'react';
import React from 'react';

interface TooltipDividerProps {
  margin?: CSSProperties['margin'];
}

/** @public */
export const TooltipDivider = ({ margin }: TooltipDividerProps) => {
  return <div style={{ margin }} className="echTooltipDivider"></div>;
};
