/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { KeyboardEventHandler, MouseEventHandler, CSSProperties } from 'react';
import React, { useCallback } from 'react';

import { useMiddleTruncatedLabel } from './use_truncated_label';
import { isRTLString } from '../../utils/common';
import type { LegendLabelOptions } from '../../utils/themes/theme';

interface LabelProps {
  label: string;
  isSeriesHidden?: boolean;
  isToggleable?: boolean;
  onToggle?: (negate: boolean) => void;
  options: LegendLabelOptions;
  hiddenSeriesCount: number;
  totalSeriesCount: number;
}

const isAppleDevice = typeof window !== 'undefined' && /Mac|iPhone|iPad/.test(window.navigator.userAgent);

const modifierKey = isAppleDevice ? '⌘' : 'Ctrl';
const showAllSeriesMessage = 'to show all';
const showSeriesMessage = 'to show';
const hideSeriesMessage = 'to hide';

function getInteractivityTitle(isSeriesVisible: boolean, hiddenSeries: number, allSeries: number) {
  if (isSeriesVisible) {
    if (allSeries - hiddenSeries === 1) {
      return `
Click ${showAllSeriesMessage}
${modifierKey} + Click ${hideSeriesMessage}`;
    }
    if (hiddenSeries > 0) {
      return `
Click ${hideSeriesMessage}`;
    }
    return `
Click ${showSeriesMessage}
${modifierKey} + Click ${hideSeriesMessage}`;
  }
  return `
Click ${showSeriesMessage}`;
}

function getInteractivityAriaLabel(isSeriesVisible: boolean, hiddenSeries: number, allSeries: number) {
  if (isSeriesVisible) {
    if (allSeries - hiddenSeries === 1) {
      return `Click: ${showAllSeriesMessage}, ${modifierKey} + Click: ${hideSeriesMessage}`;
    }
    if (hiddenSeries > 0) {
      return `Click: ${hideSeriesMessage}, ${modifierKey} + Click: ${hideSeriesMessage}`;
    }
    return `Click: ${showSeriesMessage}, ${modifierKey} + Click: ${hideSeriesMessage}`;
  }
  return `Click: ${showSeriesMessage}, ${modifierKey} + Click: ${showSeriesMessage}`;
}

/**
 * Label component used to display text in legend item
 * @internal
 */
export function Label({
  label,
  onToggle,
  isToggleable,
  isSeriesHidden,
  options,
  hiddenSeriesCount,
  totalSeriesCount,
}: LabelProps) {
  const shouldTruncateMiddle = options.truncationPosition === 'middle' && options.maxLines > 0;
  const { labelRef, truncatedLabel, isComputed } = useMiddleTruncatedLabel({
    label,
    maxLines: options.maxLines,
    shouldTruncate: shouldTruncateMiddle,
  });

  // Only apply middle truncation CSS classes when JS computation is complete
  const useMiddleClasses = shouldTruncateMiddle && isComputed;
  const { className, dir, clampStyles } = getSharedProps(label, options, !!onToggle, useMiddleClasses);

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

  const title = options.maxLines > 0 ? label : ''; // full text already visible

  return isToggleable ? (
    // This div is required to allow multiline text truncation, all ARIA requirements are still met
    // https://stackoverflow.com/questions/68673034/webkit-line-clamp-does-not-apply-to-buttons
    <div
      ref={labelRef}
      role="button"
      tabIndex={0}
      dir={dir}
      className={className}
      title={`${title}\n${getInteractivityTitle(!isSeriesHidden, hiddenSeriesCount, totalSeriesCount)}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-pressed={isSeriesHidden}
      style={clampStyles}
      aria-label={`${label}; ${getInteractivityAriaLabel(!isSeriesHidden, hiddenSeriesCount, totalSeriesCount)}`}
      data-testid="echLegendItemLabel"
    >
      {truncatedLabel}
    </div>
  ) : (
    <div
      ref={labelRef}
      dir={dir}
      className={className}
      title={label}
      style={clampStyles}
      data-testid="echLegendItemLabel"
    >
      {truncatedLabel}
    </div>
  );
}

/** @internal */
export function NonInteractiveLabel({ label, options }: { label: string; options: LegendLabelOptions }) {
  const shouldTruncateMiddle = options.truncationPosition === 'middle' && options.maxLines > 0;
  const { labelRef, truncatedLabel, isComputed } = useMiddleTruncatedLabel({
    label,
    maxLines: options.maxLines,
    shouldTruncate: shouldTruncateMiddle,
  });

  // Only apply middle truncation CSS classes when JS computation is complete
  const useMiddleClasses = shouldTruncateMiddle && isComputed;
  const { className, dir, clampStyles } = getSharedProps(label, options, false, useMiddleClasses);

  return (
    <div
      ref={labelRef}
      dir={dir}
      className={className}
      title={label}
      style={clampStyles}
      data-testid="echLegendItemLabel"
    >
      {truncatedLabel}
    </div>
  );
}

function getSharedProps(
  label: string,
  options: LegendLabelOptions,
  isToggleable?: boolean,
  useMiddleClasses?: boolean,
) {
  const maxLines = Math.abs(options.maxLines);

  const className = classNames('echLegendItem__label', {
    'echLegendItem__label--clickable': Boolean(isToggleable),
    'echLegendItem__label--singleline': maxLines === 1,
    'echLegendItem__label--singleline--middle': maxLines === 1 && useMiddleClasses,
    'echLegendItem__label--multiline': maxLines > 1,
    'echLegendItem__label--multiline--middle': maxLines > 1 && useMiddleClasses,
  });

  const dir = isRTLString(label) ? 'rtl' : 'ltr'; // forced for individual labels in case mixed charset
  const clampStyles: CSSProperties = maxLines > 1 ? { WebkitLineClamp: maxLines } : {};

  return { className, dir, clampStyles };
}
