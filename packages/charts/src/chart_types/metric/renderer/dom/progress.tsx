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

interface ProgressBarProps {
  datum: MetricWProgress | BulletMetricWProgress;
  barBackground: Color;
  panelBackground: Color;
  blendedBarColor: Color;
  size: ProgressBarSize;
}

/** @internal */
export const ProgressBar: React.FunctionComponent<ProgressBarProps> = ({
  datum,
  barBackground,
  panelBackground,
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

  const borderRadius: CSSProperties = { borderRadius: PROGRESS_BAR_BORDER_RADIUS };
  const hasProgressSpan = max - min > 0;
  const externalStroke: CSSProperties = hasProgressSpan ? { boxShadow: `0 0 0 2px ${panelBackground}` } : {};

  const targetPlacement = isNil(target) ? null : `calc(${scale(target)}% - ${PROGRESS_BAR_TARGET_SIZE / 2}px)`;
  const hasZeroMarker = domainMin < 0 && domainMax > 0;

  // When the domain crosses 0, we render a zero marker. If the progress fill touches 0,
  // square off that end so the marker reads cleanly against the fill.
  let zeroBaselineNudgePx = 0;
  if (hasZeroMarker && hasProgressSpan) {
    const PROGRESS_BAR_ADJUSTMENT_PX = 1;
    const zero = scale(0);

    const isStartAtZero = scaledValue >= zero;
    const isEndAtZero = scaledValue <= zero;

    if (isVertical) {
      if (isStartAtZero) {
        borderRadius.borderBottomLeftRadius = 0;
        borderRadius.borderBottomRightRadius = 0;
        zeroBaselineNudgePx = PROGRESS_BAR_ADJUSTMENT_PX;
      }
      if (isEndAtZero) {
        borderRadius.borderTopLeftRadius = 0;
        borderRadius.borderTopRightRadius = 0;
        zeroBaselineNudgePx = -PROGRESS_BAR_ADJUSTMENT_PX;
      }
    } else {
      if (isStartAtZero) {
        borderRadius.borderTopLeftRadius = 0;
        borderRadius.borderBottomLeftRadius = 0;
        zeroBaselineNudgePx = PROGRESS_BAR_ADJUSTMENT_PX;
      }
      if (isEndAtZero) {
        borderRadius.borderTopRightRadius = 0;
        borderRadius.borderBottomRightRadius = 0;
        zeroBaselineNudgePx = -PROGRESS_BAR_ADJUSTMENT_PX;
      }
    }
  }

  const zeroPlacement = hasZeroMarker
    ? `calc(${scale(0)}% - ${PROGRESS_BAR_TARGET_SIZE / 2 + zeroBaselineNudgePx}px)`
    : null;
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
      {hasZeroMarker && (
        <div
          className={getDirectionalClasses('ZeroBaseline', isVertical, size)}
          style={{
            [isVertical ? 'bottom' : 'left']: zeroPlacement,
          }}
        >
          <div className="echSingleMetricZeroBaseline__mark" style={{ backgroundColor: blendedBarColor }} />
        </div>
      )}
      <div
        className={getDirectionalClasses('ProgressBar', isVertical, size)}
        style={{ ...positionStyle, ...borderRadius, ...externalStroke, backgroundColor: blendedBarColor }}
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
