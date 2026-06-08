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

const METER_CORNER_RADIUS = 8;
const METER_MARKER_SIZE = 8;
const BASELINE_MARKER_ADJUSTMENT = 1;

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
  /**
   * Domain value where this stop applies.
   * Use the same units as `domain`, not a normalized 0-100 track percentage.
   */
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
  /**
   * Resolves either a single interpolated palette color or a revealed gradient.
   */
  style: Exclude<MeterFillStyle, typeof MeterFillStyle.Single>;
  /**
   * Domain-valued color stops used to resolve solid and gradient fills.
   */
  colorStops: MeterColorStop[];
  /**
   * Used when no stop can be resolved, such as an empty stop list.
   */
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
  /**
   * Domain value from which the fill grows.
   * Values at or above the baseline fill toward the track end; values below it fill
   * back toward the track start. Defaults to `0`.
   */
  baseline?: number;
  target?: number;
  markerColor?: Color;
  fillBorderColor?: Color;
  fillBorderWidth?: number;
  /**
   * Shows a marker at `baseline` when the baseline lies within `domain`.
   */
  showBaselineMarker?: boolean;
  /**
   * Rounds the track edge at the start of the domain.
   * The track start is the left edge for horizontal meters and the bottom edge for vertical meters.
   */
  roundTrackStart?: boolean;
  /**
   * Rounds the track edge at the end of the domain.
   * The track end is the right edge for horizontal meters and the top edge for vertical meters.
   */
  roundTrackEnd?: boolean;
  /**
   * Rounds the fill edge at the start of the filled span.
   * The fill start is the baseline-side edge, so it follows the direction from `baseline` to `value`.
   * When `value < baseline`, the physical start edge flips to the right for horizontal meters and the top for vertical meters.
   */
  roundFillStart?: boolean;
  /**
   * Rounds the fill edge at the end of the filled span.
   * The fill end is the value-side edge, so it follows the direction from `baseline` to `value`.
   * When `value < baseline`, the physical end edge flips to the left for horizontal meters and the bottom for vertical meters.
   */
  roundFillEnd?: boolean;
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
  baseline = 0,
  target,
  markerColor,
  fillBorderColor,
  fillBorderWidth = 0,
  showBaselineMarker = false,
  roundTrackStart = true,
  roundTrackEnd = true,
  roundFillStart = true,
  roundFillEnd = true,
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
  const geometry = getMeterGeometry(normalizedDomain, value, baseline);
  const baselinePosition = geometry.rawBaselinePosition;
  const hasVisibleBaselineMarker = geometry.isBaselineInDomain && showBaselineMarker;
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
      : getMeterSolidFillColor(normalizedDomain, fill.colorStops, baseline, fallbackFillColor));
  const [resolvedAriaValueMin, resolvedAriaValueMax] = sortNumbers([
    ariaValueMin ?? domainMin,
    ariaValueMax ?? domainMax,
  ]);
  const resolvedAriaValueNow = clamp(ariaValueNow ?? value, resolvedAriaValueMin, resolvedAriaValueMax);

  const isFillForward = geometry.rawValuePosition >= geometry.rawBaselinePosition;
  let baselineMarkerNudgePx = 0;
  const fillBorderRadius = getFillBorderRadius({
    isVertical,
    isForward: isFillForward,
    roundStart: roundFillStart,
    roundEnd: roundFillEnd,
  });
  const trackBorderRadius = getTrackBorderRadius({
    isVertical,
    roundStart: roundTrackStart,
    roundEnd: roundTrackEnd,
  });

  if (geometry.isBaselineInDomain && geometry.fillSize > 0 && !roundFillStart) {
    baselineMarkerNudgePx = isFillForward ? BASELINE_MARKER_ADJUSTMENT : -BASELINE_MARKER_ADJUSTMENT;
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
            top: 'auto',
            height: `${revealWindow.scaleFactor * 100}%`,
            bottom: `${revealWindow.offset}%`,
            backgroundImage: gradientFill,
          }
        : {
            right: 'auto',
            width: `${revealWindow.scaleFactor * 100}%`,
            left: `${revealWindow.offset}%`,
            backgroundImage: gradientFill,
          }
      : {
          backgroundColor: solidFillColor,
        };

  const targetPlacement = isNil(target)
    ? null
    : `calc(${clamp(getMeterScalePosition(normalizedDomain, target), 0, 100)}% - ${METER_MARKER_SIZE / 2}px)`;
  const baselinePlacement = hasVisibleBaselineMarker
    ? `calc(${baselinePosition}% - ${METER_MARKER_SIZE / 2 + baselineMarkerNudgePx}px)`
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
      style={{ ...style, backgroundColor: trackColor, ...trackBorderRadius }}
      title={title}
    >
      {targetPlacement && (
        <div
          className={getDirectionalClasses('echMeterTarget', isVertical)}
          style={{
            [isVertical ? 'bottom' : 'left']: targetPlacement,
          }}
          title={targetTitle}
        >
          <Icon height={METER_MARKER_SIZE} width={METER_MARKER_SIZE} type="downArrow" color={resolvedMarkerColor} />
        </div>
      )}
      {baselinePlacement && (
        <div
          className={getDirectionalClasses('echMeterBaselineMarker', isVertical)}
          style={{
            [isVertical ? 'bottom' : 'left']: baselinePlacement,
          }}
        >
          <div className="echMeterBaselineMarker__mark" style={{ backgroundColor: resolvedMarkerColor }} />
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

function getTrackBorderRadius({
  isVertical,
  roundStart,
  roundEnd,
}: {
  isVertical: boolean;
  roundStart: boolean;
  roundEnd: boolean;
}): CSSProperties {
  const startRadius = roundStart ? METER_CORNER_RADIUS : 0;
  const endRadius = roundEnd ? METER_CORNER_RADIUS : 0;

  return isVertical
    ? {
        borderTopLeftRadius: endRadius,
        borderTopRightRadius: endRadius,
        borderBottomLeftRadius: startRadius,
        borderBottomRightRadius: startRadius,
      }
    : {
        borderTopLeftRadius: startRadius,
        borderTopRightRadius: endRadius,
        borderBottomLeftRadius: startRadius,
        borderBottomRightRadius: endRadius,
      };
}

function getFillBorderRadius({
  isVertical,
  isForward,
  roundStart,
  roundEnd,
}: {
  isVertical: boolean;
  isForward: boolean;
  roundStart: boolean;
  roundEnd: boolean;
}): CSSProperties {
  const startRadius = roundStart ? METER_CORNER_RADIUS : 0;
  const endRadius = roundEnd ? METER_CORNER_RADIUS : 0;

  if (isVertical) {
    return isForward
      ? {
          borderTopLeftRadius: endRadius,
          borderTopRightRadius: endRadius,
          borderBottomLeftRadius: startRadius,
          borderBottomRightRadius: startRadius,
        }
      : {
          borderTopLeftRadius: startRadius,
          borderTopRightRadius: startRadius,
          borderBottomLeftRadius: endRadius,
          borderBottomRightRadius: endRadius,
        };
  }

  return isForward
    ? {
        borderTopLeftRadius: startRadius,
        borderTopRightRadius: endRadius,
        borderBottomLeftRadius: startRadius,
        borderBottomRightRadius: endRadius,
      }
    : {
        borderTopLeftRadius: endRadius,
        borderTopRightRadius: startRadius,
        borderBottomLeftRadius: endRadius,
        borderBottomRightRadius: startRadius,
      };
}

function getDirectionalClasses(base: string, isVertical: boolean) {
  return classNames(base, {
    [`${base}--vertical`]: isVertical,
    [`${base}--horizontal`]: !isVertical,
  });
}
