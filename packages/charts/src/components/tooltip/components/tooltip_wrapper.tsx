/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import { renderComplexChildren } from '../../../utils/common';
import { useTooltipContext } from './tooltip_provider';

type TooltipWrapperProps = PropsWithChildren<{
  className?: string;
}>;

/** @internal */
export const TooltipWrapper = ({ children, className }: TooltipWrapperProps) => {
  const { dir, stuck } = useTooltipContext();

  return (
    <div
      className={classNames('echTooltip', className, {
        'echTooltip--stuck': stuck,
      })}
      dir={dir}
      onClick={(e) => {
        // e.stopPropagation();
        console.log('clicked');
      }}
    >
      {renderComplexChildren(children)}
      {/* TODO: add when tooltip is sticky */}
      {/* <div className="echTooltip__stickyAction">Click to stick tooltip</div> */}
    </div>
  );
};
