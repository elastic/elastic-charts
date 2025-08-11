/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import { scaleLinear } from 'd3-scale';
import type { CSSProperties } from 'react';
import React from 'react';

import type { ProgressBarSize } from './metric';
import { PROGRESS_BAR_TARGET_SIZE } from './text_measurements';
import type { Color } from '../../../../common/colors';
import { Icon } from '../../../../components/icons/icon';
import { isNil, LayoutDirection, sortNumbers } from '../../../../utils/common';
import type { ContinuousDomain, GenericDomain } from '../../../../utils/domain';
import type { BulletMetricWProgress, MetricWProgress } from '../../specs';
import { isBulletMetric } from '../../specs';

/**
 * Synced with _progress.scss
 * @internal
 */
const PROGRESS_BAR_BORDER_RADIUS = 8;

/**
 * Synced with _progress.scss
 */
const zeroBaselineSizeMap = {
  small: 2,
  medium: 2,
  large: 4,
};

interface ProgressBarProps {
  datum: MetricWProgress | BulletMetricWProgress;
  barBackground: Color;
  blendedBarColor: Color;
  size: ProgressBarSize;
}

/** @internal */
export const ProgressBar: React.FunctionComponent<ProgressBarProps> = ({
  datum,
  barBackground,
  blendedBarColor,
  size,
}) => {
  const { title, value, target, valueFormatter, targetFormatter, progressBarDirection } = datum;
  const isBullet = isBulletMetric(datum);
  const isVertical = progressBarDirection === LayoutDirection.Vertical;
  const domain: GenericDomain = isBulletMetric(datum) ? datum.domain : [0, datum.domainMax];
  // TODO clamp and round values
  const scale = scaleLinear().domain(domain).range([0, 100]);

  if (isBulletMetric(datum) && datum.niceDomain) {
    scale.nice();
  }

  const updatedDomain = scale.domain() as GenericDomain;
  const [domainMin, domainMax] = sortNumbers(updatedDomain) as ContinuousDomain;
  const scaledValue = scale(value);
  const [min, max] = sortNumbers([scale(0), scaledValue]);
  const endValue = 100 - max;
  const safeStartValue = Math.max(0, min);
  const safeEndValue = Math.max(0, endValue);
  const positionStyle = isVertical
    ? {
        bottom: `${safeStartValue}%`,
        top: `${safeEndValue}%`,
      }
    : {
        left: `${safeStartValue}%`,
        right: `${safeEndValue}%`,
      };

  let borderRadius: CSSProperties = {};
  if (!isVertical && endValue <= 0) {
    borderRadius = {
      ...borderRadius,
      borderTopRightRadius: PROGRESS_BAR_BORDER_RADIUS,
      borderBottomRightRadius: PROGRESS_BAR_BORDER_RADIUS,
    };
  }
  if (!isVertical && min <= 0) {
    borderRadius = {
      ...borderRadius,
      borderTopLeftRadius: PROGRESS_BAR_BORDER_RADIUS,
      borderBottomLeftRadius: PROGRESS_BAR_BORDER_RADIUS,
    };
  }

  // For vertical progress bar
  if (isVertical && endValue <= 0) {
    borderRadius = {
      ...borderRadius,
      borderTopLeftRadius: PROGRESS_BAR_BORDER_RADIUS,
      borderTopRightRadius: PROGRESS_BAR_BORDER_RADIUS,
    };
  }
  if (isVertical && min <= 0) {
    borderRadius = {
      ...borderRadius,
      borderBottomLeftRadius: PROGRESS_BAR_BORDER_RADIUS,
      borderBottomRightRadius: PROGRESS_BAR_BORDER_RADIUS,
    };
  }

  const zeroBaselineSize = zeroBaselineSizeMap[size];

  const targetPlacement = isNil(target) ? null : `calc(${scale(target)}% - ${PROGRESS_BAR_TARGET_SIZE / 2}px)`;
  const zeroPlacement = domainMin >= 0 || domainMax <= 0 ? null : `calc(${scale(0)}% - ${zeroBaselineSize / 2}px)`;

  const labelType = isBullet ? 'Value' : 'Percentage';

  return (
    <div
      className={getDirectionalClasses('Progress', isVertical, size)}
      style={{ backgroundColor: barBackground }}
      title={!isBullet ? '' : `${updatedDomain[0]} to ${updatedDomain[1]}`}
    >
      {targetPlacement && (
        <div
          className={getDirectionalClasses('Target', isVertical, size)}
          style={{
            [isVertical ? 'bottom' : 'left']: targetPlacement,
          }}
          aria-valuenow={target}
          title={`${isBullet ? `${datum.valueLabels.target}: ` : ''}${(targetFormatter ?? valueFormatter)(
            target || 0,
          )}`}
        >
          <Icon
            height={PROGRESS_BAR_TARGET_SIZE}
            width={PROGRESS_BAR_TARGET_SIZE}
            type="downArrow"
            color={blendedBarColor}
          />
        </div>
      )}
      {zeroPlacement && (
        <div
          className={getDirectionalClasses('ZeroBaseline', isVertical, size)}
          style={{
            backgroundColor: blendedBarColor,
            [isVertical ? 'bottom' : 'left']: zeroPlacement,
          }}
        />
      )}
      <div
        className={getDirectionalClasses('ProgressBar', isVertical, size)}
        style={{ ...positionStyle, ...borderRadius, backgroundColor: blendedBarColor }}
        role="meter"
        title={isBullet ? `${datum.valueLabels.value}: ${valueFormatter(value)}` : `${scaledValue}%`}
        aria-label={title ? `${labelType} of ${title}` : labelType}
        aria-valuemin={isBullet ? domainMin : 0}
        aria-valuemax={isBullet ? domainMax : 100}
        aria-valuenow={isBullet ? value : scaledValue}
      />
    </div>
  );
};

function getDirectionalClasses(element: string, isVertical: boolean, progressBarSize: ProgressBarProps['size']) {
  const base = `echSingleMetric${element}`;
  return classNames(base, `${base}--${progressBarSize}`, {
    [`${base}--vertical`]: isVertical,
    [`${base}--horizontal`]: !isVertical,
  });
}
