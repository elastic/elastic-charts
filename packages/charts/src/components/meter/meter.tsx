/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React from 'react';
import type { $Values } from 'utility-types';

import {
  getMeterGradientFill,
  getMeterGeometry,
  getMeterRevealWindow,
  getMeterScalePosition,
  getMeterSolidFillColor,
} from './utils';
import type { Color } from '../../common/colors';
import { clamp, isNil, LayoutDirection, sortNumbers } from '../../utils/common';
import type { LayoutDirection as LayoutDirectionType } from '../../utils/common';
import type { ContinuousDomain } from '../../utils/domain';
import { Icon } from '../icons/icon';

const METER_BORDER_RADIUS = 8;
const METER_MARKER_SIZE = 8;
const ZERO_BASELINE_ADJUSTMENT = 1;

/** @alpha */
export type MeterOrientation = LayoutDirectionType;

/**
 * Distinct thickness presets for the DOM Meter component.
 * @alpha
 */
export const MeterSize = Object.freeze({
  Small: 'small' as const,
  Medium: 'medium' as const,
  Large: 'large' as const,
});
/** @alpha */
export type MeterSize = $Values<typeof MeterSize>;

/**
 * Supported fill styles for the Meter component.
 * @alpha
 */
export const MeterFillStyle = Object.freeze({
  Single: 'single' as const,
  Solid: 'solid' as const,
  Gradient: 'gradient' as const,
});
/** @alpha */
export type MeterFillStyle = $Values<typeof MeterFillStyle>;

/**
 * A domain-aware color stop used for solid and gradient fills.
 * @alpha
 */
export interface MeterColorStop {
  color: Color;
  stop: number;
}

/**
 * A single-color Meter fill.
 * @alpha
 */
export interface MeterSingleFill {
  type: typeof MeterFillStyle.Single;
  color: Color;
}

/**
 * A palette-driven Meter fill.
 * @alpha
 */
export interface MeterPaletteFill {
  type: 'palette';
  style: Exclude<MeterFillStyle, typeof MeterFillStyle.Single>;
  colorStops: MeterColorStop[];
  fallbackColor?: Color;
}

/**
 * Supported Meter fill configurations.
 * @alpha
 */
export type MeterFill = MeterSingleFill | MeterPaletteFill;

/**
 * Props for the reusable DOM Meter component.
 * @alpha
 */
export interface MeterProps {
  value: number;
  domain: ContinuousDomain;
  fill: MeterFill;
  trackColor: Color;
  orientation?: MeterOrientation;
  size?: MeterSize;
  target?: number;
  markerColor?: Color;
  fillBorderColor?: Color;
  fillBorderWidth?: number;
  showZeroBaseline?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
  valueTitle?: string;
  targetTitle?: string;
  ariaLabel?: string;
  ariaValueText?: string;
  ariaValueMin?: number;
  ariaValueMax?: number;
  ariaValueNow?: number;
}

/** @alpha */
export const Meter: React.FunctionComponent<MeterProps> = ({
  value,
  domain,
  fill,
  trackColor,
  orientation = LayoutDirection.Horizontal,
  size = MeterSize.Medium,
  target,
  markerColor,
  fillBorderColor,
  fillBorderWidth = 0,
  showZeroBaseline,
  className,
  style,
  title,
  valueTitle,
  targetTitle,
  ariaLabel = 'Meter',
  ariaValueText,
  ariaValueMin,
  ariaValueMax,
  ariaValueNow,
}) => {
  const isVertical = orientation === LayoutDirection.Vertical;
  const normalizedDomain = sortNumbers(domain);
  const [domainMin, domainMax] = normalizedDomain;
  const geometry = getMeterGeometry(normalizedDomain, value);
  const zeroPosition = clamp(geometry.rawZeroPosition, 0, 100);
  const hasVisibleZeroBaseline = geometry.hasZeroBaseline && (showZeroBaseline ?? true);
  const fallbackFillColor =
    fill.type === MeterFillStyle.Single ? fill.color : fill.fallbackColor ?? fill.colorStops[0]?.color ?? trackColor;
  const solidFillColor =
    fill.type === MeterFillStyle.Single
      ? fill.color
      : getMeterSolidFillColor(normalizedDomain, fill.colorStops, value, fallbackFillColor);
  const gradientFill =
    fill.type === 'palette' && fill.style === MeterFillStyle.Gradient
      ? getMeterGradientFill(normalizedDomain, fill.colorStops, orientation)
      : undefined;
  const revealWindow = gradientFill ? getMeterRevealWindow(geometry.fillStart, geometry.fillSize) : undefined;
  const resolvedMarkerColor =
    markerColor ??
    (fill.type === MeterFillStyle.Single
      ? fill.color
      : getMeterSolidFillColor(normalizedDomain, fill.colorStops, 0, fallbackFillColor));
  const [resolvedAriaValueMin, resolvedAriaValueMax] = sortNumbers([
    ariaValueMin ?? domainMin,
    ariaValueMax ?? domainMax,
  ]);
  const resolvedAriaValueNow = clamp(ariaValueNow ?? value, resolvedAriaValueMin, resolvedAriaValueMax);

  let zeroBaselineNudgePx = 0;
  const fillBorderRadius: CSSProperties = { borderRadius: METER_BORDER_RADIUS };

  if (hasVisibleZeroBaseline && geometry.fillSize > 0) {
    const isStartAtZero = geometry.rawValuePosition >= geometry.rawZeroPosition;
    const isEndAtZero = geometry.rawValuePosition <= geometry.rawZeroPosition;

    if (isVertical) {
      if (isStartAtZero) {
        fillBorderRadius.borderBottomLeftRadius = 0;
        fillBorderRadius.borderBottomRightRadius = 0;
        zeroBaselineNudgePx = ZERO_BASELINE_ADJUSTMENT;
      }

      if (isEndAtZero) {
        fillBorderRadius.borderTopLeftRadius = 0;
        fillBorderRadius.borderTopRightRadius = 0;
        zeroBaselineNudgePx = -ZERO_BASELINE_ADJUSTMENT;
      }
    } else {
      if (isStartAtZero) {
        fillBorderRadius.borderTopLeftRadius = 0;
        fillBorderRadius.borderBottomLeftRadius = 0;
        zeroBaselineNudgePx = ZERO_BASELINE_ADJUSTMENT;
      }

      if (isEndAtZero) {
        fillBorderRadius.borderTopRightRadius = 0;
        fillBorderRadius.borderBottomRightRadius = 0;
        zeroBaselineNudgePx = -ZERO_BASELINE_ADJUSTMENT;
      }
    }
  }

  const fillBorderStyle: CSSProperties =
    geometry.fillSize > 0 && fillBorderColor && fillBorderWidth > 0
      ? { boxShadow: `0 0 0 ${fillBorderWidth}px ${fillBorderColor}` }
      : {};

  const fillWindowStyle: CSSProperties = isVertical
    ? {
        bottom: `${geometry.fillStart}%`,
        top: `${100 - geometry.fillEnd}%`,
      }
    : {
        left: `${geometry.fillStart}%`,
        right: `${100 - geometry.fillEnd}%`,
      };

  const fillPaintStyle: CSSProperties =
    gradientFill && revealWindow
      ? isVertical
        ? {
            height: `${revealWindow.scaleFactor}%`,
            bottom: `${revealWindow.offset}%`,
            backgroundImage: gradientFill,
          }
        : {
            width: `${revealWindow.scaleFactor}%`,
            left: `${revealWindow.offset}%`,
            backgroundImage: gradientFill,
          }
      : {
          backgroundColor: solidFillColor,
        };

  const targetPlacement = isNil(target)
    ? null
    : `calc(${clamp(getMeterScalePosition(normalizedDomain, target), 0, 100)}% - ${METER_MARKER_SIZE / 2}px)`;
  const zeroPlacement = hasVisibleZeroBaseline
    ? `calc(${zeroPosition}% - ${METER_MARKER_SIZE / 2 + zeroBaselineNudgePx}px)`
    : null;

  return (
    <div
      className={classNames(
        'echMeter',
        `echMeter--${size}`,
        {
          'echMeter--vertical': isVertical,
          'echMeter--horizontal': !isVertical,
        },
        className,
      )}
      style={{ ...style, backgroundColor: trackColor }}
      title={title}
    >
      {targetPlacement && (
        <div
          className={getDirectionalClasses('echMeterTarget', isVertical)}
          style={{
            [isVertical ? 'bottom' : 'left']: targetPlacement,
          }}
          aria-valuenow={target}
          title={targetTitle}
        >
          <Icon height={METER_MARKER_SIZE} width={METER_MARKER_SIZE} type="downArrow" color={resolvedMarkerColor} />
        </div>
      )}
      {zeroPlacement && (
        <div
          className={getDirectionalClasses('echMeterZeroBaseline', isVertical)}
          style={{
            [isVertical ? 'bottom' : 'left']: zeroPlacement,
          }}
        >
          <div className="echMeterZeroBaseline__mark" style={{ backgroundColor: resolvedMarkerColor }} />
        </div>
      )}
      <div
        className={getDirectionalClasses('echMeterBar', isVertical)}
        style={{ ...fillWindowStyle, ...fillBorderRadius, ...fillBorderStyle }}
        role="meter"
        title={valueTitle}
        aria-label={ariaLabel}
        aria-valuemin={resolvedAriaValueMin}
        aria-valuemax={resolvedAriaValueMax}
        aria-valuenow={resolvedAriaValueNow}
        aria-valuetext={ariaValueText}
      >
        {geometry.fillSize > 0 && (
          <div
            className={classNames('echMeterFillPaint', {
              'echMeterFillPaint--vertical': isVertical,
              'echMeterFillPaint--horizontal': !isVertical,
            })}
            style={{ ...fillPaintStyle, ...fillBorderRadius }}
          />
        )}
      </div>
    </div>
  );
};

function getDirectionalClasses(base: string, isVertical: boolean) {
  return classNames(base, {
    [`${base}--vertical`]: isVertical,
    [`${base}--horizontal`]: !isVertical,
  });
}
