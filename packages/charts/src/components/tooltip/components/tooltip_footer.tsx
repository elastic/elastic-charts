/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PropsWithChildren } from 'react';

import { renderComplexChildren } from '../../../utils/common';

type TooltipFooterProps = PropsWithChildren<{}>;

/** @public */
export const TooltipFooter = ({ children }: TooltipFooterProps) => {
  return <div className="echTooltipFooter">{renderComplexChildren(children)}</div>;
};
