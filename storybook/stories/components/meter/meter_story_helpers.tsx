/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { MeterFill, MeterProps } from '@elastic/charts';
import { LayoutDirection, Meter, MeterSize } from '@elastic/charts';

import { useBaseTheme, useThemeId } from '../../../use_base_theme';

export const positivePalette = [
  { stop: 0, color: '#54B399' },
  { stop: 60, color: '#F5A700' },
  { stop: 100, color: '#D36086' },
];

export const signedPalette = [
  { stop: -100, color: '#6092C0' },
  { stop: 0, color: '#F5A700' },
  { stop: 40, color: '#D36086' },
];

interface MeterPreviewProps
  extends Pick<
    MeterProps,
    | 'domain'
    | 'orientation'
    | 'size'
    | 'baseline'
    | 'target'
    | 'trackColor'
    | 'markerColor'
    | 'fillBorderColor'
    | 'fillBorderWidth'
    | 'showBaselineMarker'
    | 'flatBaselineEdge'
    | 'roundTrack'
    | 'roundFill'
  > {
  title: string;
  label: string;
  value: number;
  fill: MeterFill;
  alignment?: 'left' | 'right';
  barWidth?: number;
  barHeight?: number;
  showLabel?: boolean;
}

export function MeterPreview({
  title,
  label,
  value,
  domain,
  fill,
  size = MeterSize.Medium,
  orientation = LayoutDirection.Horizontal,
  baseline,
  target,
  trackColor,
  markerColor,
  fillBorderColor,
  fillBorderWidth = 2,
  showBaselineMarker,
  flatBaselineEdge,
  roundTrack,
  roundFill,
  alignment = 'right',
  barWidth = 320,
  barHeight = 160,
  showLabel = true,
}: MeterPreviewProps) {
  const baseTheme = useBaseTheme();
  const themeId = useThemeId();
  const isVertical = orientation === LayoutDirection.Vertical;
  const isDarkTheme = themeId.includes('dark');
  const textColor = isDarkTheme ? baseTheme.metric.textLightColor : baseTheme.metric.textDarkColor;
  const resolvedTrackColor = trackColor ?? baseTheme.metric.barBackground;
  const resolvedMarkerColor = markerColor ?? textColor;
  const resolvedFillBorderColor = fillBorderColor ?? baseTheme.background.color ?? '#FFFFFF';
  const labelView =
    showLabel && label ? (
      <div style={{ color: textColor, fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
        {label}
      </div>
    ) : null;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ color: textColor, fontSize: 12, fontWeight: 600 }}>{title}</div>
      {isVertical ? (
        <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: 48, height: barHeight }}>
            <Meter
              value={value}
              domain={domain}
              fill={fill}
              trackColor={resolvedTrackColor}
              baseline={baseline}
              markerColor={resolvedMarkerColor}
              fillBorderColor={resolvedFillBorderColor}
              fillBorderWidth={fillBorderWidth}
              orientation={orientation}
              size={size}
              target={target}
              showBaselineMarker={showBaselineMarker}
              flatBaselineEdge={flatBaselineEdge}
              roundTrack={roundTrack}
              roundFill={roundFill}
              ariaLabel={title}
              ariaValueText={label}
              style={{ height: '100%', margin: '0 auto' }}
            />
          </div>
          {labelView}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: labelView
              ? alignment === 'left'
                ? `auto ${barWidth}px`
                : `${barWidth}px auto`
              : `${barWidth}px`,
            gap: labelView ? 12 : 0,
            alignItems: 'center',
          }}
        >
          {alignment === 'left' && labelView}
          <Meter
            value={value}
            domain={domain}
            fill={fill}
            trackColor={resolvedTrackColor}
            baseline={baseline}
            markerColor={resolvedMarkerColor}
            fillBorderColor={resolvedFillBorderColor}
            fillBorderWidth={fillBorderWidth}
            orientation={orientation}
            size={size}
            target={target}
            showBaselineMarker={showBaselineMarker}
            flatBaselineEdge={flatBaselineEdge}
            roundTrack={roundTrack}
            roundFill={roundFill}
            ariaLabel={title}
            ariaValueText={label}
            style={{ width: barWidth }}
          />
          {alignment !== 'left' && labelView}
        </div>
      )}
    </div>
  );
}

export function StoryShell({ children }: { children: React.ReactNode }) {
  const baseTheme = useBaseTheme();
  const themeId = useThemeId();
  const isDarkTheme = themeId.includes('dark');
  const textColor = isDarkTheme ? baseTheme.metric.textLightColor : baseTheme.metric.textDarkColor;

  return (
    <div
      data-test-subj="echMeterStory"
      style={{
        display: 'grid',
        gap: 24,
        width: 'fit-content',
        minWidth: 420,
        padding: 24,
        color: textColor,
        backgroundColor: baseTheme.background.color ?? '#FFFFFF',
      }}
    >
      {children}
    </div>
  );
}

export function getStandaloneEnumOverride<T extends string>(queryParam: string, allowedValues: readonly T[]) {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const value = new URLSearchParams(window.location.search).get(queryParam);
  return value && allowedValues.includes(value as T) ? (value as T) : undefined;
}
