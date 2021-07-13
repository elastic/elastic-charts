/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { MouseEventHandler } from 'react';

interface LabelProps {
  label: string;
  isSeriesHidden?: boolean;
  isToggleable?: boolean;
  onClick?: MouseEventHandler;
}
/**
 * Label component used to display text in legend item
 * @internal
 */
export function Label({ label, isToggleable, onClick, isSeriesHidden }: LabelProps) {
  const labelClassNames = classNames('echLegendItem__label', {
    'echLegendItem__label--clickable': Boolean(onClick),
  });

  return isToggleable ? (
    <button
      type="button"
      className={labelClassNames}
      title={label}
      onClick={onClick}
      aria-label={
        isSeriesHidden ? `${label}; Activate to show series in graph` : `${label}; Activate to hide series in graph`
      }
    >
      {label}
    </button>
  ) : (
    <div className={labelClassNames} title={label} onClick={onClick}>
      {label}
    </div>
  );
}
