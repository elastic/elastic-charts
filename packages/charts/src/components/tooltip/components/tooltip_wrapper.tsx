/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { ReactNode } from 'react';

import { renderComplexChildren } from '../../../utils/common';
import { useTooltipContext } from './tooltip_provider';

interface TooltipWrapperProps {
  className?: string;
  children: ReactNode;
}

/** @public */
export const TooltipWrapper = ({ children, className }: TooltipWrapperProps) => {
  const { dir } = useTooltipContext();

  return (
    <div className={classNames('echTooltip', className)} dir={dir}>
      {renderComplexChildren(children)}
      {/* TODO: add when tooltip is sticky */}
      {/* <div className="echTooltip__stickyAction">Click to stick tooltip</div> */}
    </div>
  );
};
