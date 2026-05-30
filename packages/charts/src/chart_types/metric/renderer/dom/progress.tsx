/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import { scaleLinear } from 'd3-scale';
import React from 'react';

import { combineColors } from '../../../../common/color_calcs';
import { RGBATupleToString, colorToRgba } from '../../../../common/color_library_wrappers';
import type { Color } from '../../../../common/colors';
import type { MeterFill } from '../../../../components/meter';
import { Meter, MeterFillStyle, MeterSize } from '../../../../components/meter';
import { getMeterScalePosition } from '../../../../components/meter/utils';
import { clamp, isNil, LayoutDirection, sortNumbers } from '../../../../utils/common';
import type { ContinuousDomain, GenericDomain } from '../../../../utils/domain';
import type { BulletMetricWProgress, MetricWProgress } from '../../specs';
import { isBulletMetric } from '../../specs';

interface ProgressBarProps {
  datum: MetricWProgress | BulletMetricWProgress;
  barBackground: Color;
  panelBackground: Color;
  fillBackgroundColor: Color;
  blendedBarColor: Color;
  size: MeterSize;
  fill?: MeterFill;
}

/** @internal */
export function getMetricProgressBarSize(progressBarThickness?: number): MeterSize {
  switch (progressBarThickness) {
    case 4:
      return MeterSize.Small;
    case 8:
      return MeterSize.Medium;
    case 16:
      return MeterSize.Large;
    default:
      return MeterSize.Small;
  }
}

/** @internal */
export function getMetricProgressBarThickness(size?: MeterSize) {
  switch (size) {
    case MeterSize.Small:
      return 4;
    case MeterSize.Medium:
      return 8;
    case MeterSize.Large:
      return 16;
    default:
      return undefined;
  }
}

function blendMetricProgressColor(color: Color, backgroundColor: Color) {
  return RGBATupleToString(combineColors(colorToRgba(color), colorToRgba(backgroundColor)));
}

function resolveMetricProgressBarFill(
  fill: MeterFill | undefined,
  fallbackColor: Color,
  backgroundColor: Color,
): MeterFill {
  if (!fill) {
    return { type: MeterFillStyle.Single, color: fallbackColor };
  }

  if (fill.type === MeterFillStyle.Single) {
    return {
      ...fill,
      color: blendMetricProgressColor(fill.color, backgroundColor),
    };
  }

  return {
    ...fill,
    colorStops: fill.colorStops.map((stop) => ({
      ...stop,
      color: blendMetricProgressColor(stop.color, backgroundColor),
    })),
    fallbackColor:
      fill.fallbackColor === undefined ? undefined : blendMetricProgressColor(fill.fallbackColor, backgroundColor),
  };
}

/** @internal */
export const ProgressBar: React.FunctionComponent<ProgressBarProps> = ({
  datum,
  barBackground,
  panelBackground,
  fillBackgroundColor,
  blendedBarColor,
  size,
  fill,
}) => {
  const { title, value, target, valueFormatter, targetFormatter, progressBarDirection } = datum;
  const isBullet = isBulletMetric(datum);
  const isVertical = progressBarDirection === LayoutDirection.Vertical;
  const domain: GenericDomain = isBulletMetric(datum) ? datum.domain : [0, datum.domainMax];
  const scale = scaleLinear().domain(domain).range([0, 100]);

  if (isBulletMetric(datum) && datum.niceDomain) {
    scale.nice();
  }

  const updatedDomain = scale.domain() as ContinuousDomain;
  const [domainMin, domainMax] = sortNumbers(updatedDomain);
  const scaledValue = clamp(getMeterScalePosition(updatedDomain, value), 0, 100);
  const roundedScaledValue = Math.round(scaledValue * 100) / 100;
  const hasZeroBaselineMarker = domainMin < 0 && domainMax > 0;
  const labelType = isBullet ? 'Value' : 'Percentage';
  const progressBarFill = resolveMetricProgressBarFill(fill, blendedBarColor, fillBackgroundColor);

  return (
    <Meter
      value={value}
      domain={updatedDomain}
      fill={progressBarFill}
      trackColor={barBackground}
      orientation={progressBarDirection}
      size={size}
      baseline={0} // Fixed baseline for signed domains for Metric chart
      target={target}
      markerColor={fill ? undefined : blendedBarColor}
      fillBorderColor={panelBackground}
      fillBorderWidth={2}
      showBaselineMarker={hasZeroBaselineMarker}
      roundTrackStart
      roundTrackEnd
      roundFillStart={!hasZeroBaselineMarker}
      roundFillEnd
      className={getDirectionalClasses('Progress', isVertical, size)}
      title={!isBullet ? '' : `${updatedDomain[0]} to ${updatedDomain[1]}`}
      valueTitle={isBullet ? `${datum.valueLabels.value}: ${valueFormatter(value)}` : `${roundedScaledValue}%`}
      targetTitle={
        isNil(target)
          ? undefined
          : `${isBullet ? `${datum.valueLabels.target}: ` : ''}${(targetFormatter ?? valueFormatter)(target)}`
      }
      ariaLabel={title ? `${labelType} of ${title}` : labelType}
      ariaValueMin={isBullet ? domainMin : 0}
      ariaValueMax={isBullet ? domainMax : 100}
      ariaValueNow={isBullet ? value : roundedScaledValue}
      ariaValueText={isBullet ? valueFormatter(value) : `${roundedScaledValue}%`}
    />
  );
};

function getDirectionalClasses(element: string, isVertical: boolean, progressBarSize: ProgressBarProps['size']) {
  const base = `echSingleMetric${element}`;
  return classNames(base, `${base}--${progressBarSize}`, {
    [`${base}--vertical`]: isVertical,
    [`${base}--horizontal`]: !isVertical,
  });
}
