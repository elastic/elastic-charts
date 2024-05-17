/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { KeyboardEventHandler, MouseEventHandler, useCallback } from 'react';

import { isRTLString } from '../../utils/common';
import { LegendLabelOptions } from '../../utils/themes/theme';

interface LabelProps {
  label: string;
  isSeriesHidden?: boolean;
  isToggleable?: boolean;
  onToggle?: (negate: boolean) => void;
  options: LegendLabelOptions;
}

const isAppleDevice = typeof window !== 'undefined' && /Mac|iPhone|iPad/.test(window.navigator.userAgent);

/**
 * Label component used to display text in legend item
 * @internal
 */
export function Label({ label, isToggleable, onToggle, isSeriesHidden, options }: LabelProps) {
  const maxLines = Math.abs(options.maxLines);
  const labelClassNames = classNames('echLegendItem__label', {
    'echLegendItem__label--clickable': Boolean(onToggle),
    'echLegendItem__label--singleline': maxLines === 1,
    'echLegendItem__label--multiline': maxLines > 1,
  });

  const onClick: MouseEventHandler = useCallback(
    ({ metaKey, ctrlKey }) => onToggle?.(isAppleDevice ? metaKey : ctrlKey),
    [onToggle],
  );
  const onKeyDown: KeyboardEventHandler = useCallback(
    ({ key, metaKey, ctrlKey }) => {
      if (key === ' ' || key === 'Enter') onToggle?.(isAppleDevice ? metaKey : ctrlKey);
    },
    [onToggle],
  );

  const dir = isRTLString(label) ? 'rtl' : 'ltr'; // forced for individual labels in case mixed charset
  const title = options.maxLines > 0 ? label : ''; // full text already visible
  const clampStyles = maxLines > 1 ? { WebkitLineClamp: maxLines } : {};

  return isToggleable ? (
    // This div is required to allow multiline text truncation, all ARIA requirements are still met
    // https://stackoverflow.com/questions/68673034/webkit-line-clamp-does-not-apply-to-buttons
    <div
      role="button"
      tabIndex={0}
      dir={dir}
      className={labelClassNames}
      title={title}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-pressed={isSeriesHidden}
      style={clampStyles}
      aria-label={
        isSeriesHidden ? `${label}; Activate to show series in graph` : `${label}; Activate to hide series in graph`
      }
    >
      {label}
    </div>
  ) : (
    <div dir={dir} className={labelClassNames} title={label} style={clampStyles}>
      {label}
    </div>
  );
}
