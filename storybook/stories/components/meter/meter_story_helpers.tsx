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
    | 'target'
    | 'trackColor'
    | 'markerColor'
    | 'fillBorderColor'
    | 'fillBorderWidth'
    | 'showZeroBaseline'
  > {
  title: string;
  label: string;
  value: number;
  fill: MeterFill;
  alignment?: 'left' | 'right';
  barWidth?: number;
  barHeight?: number;
}

export function MeterPreview({
  title,
  label,
  value,
  domain,
  fill,
  size = MeterSize.Medium,
  orientation = LayoutDirection.Horizontal,
  target,
  trackColor,
  markerColor,
  fillBorderColor,
  fillBorderWidth = 2,
  showZeroBaseline,
  alignment = 'right',
  barWidth = 320,
  barHeight = 160,
}: MeterPreviewProps) {
  const baseTheme = useBaseTheme();
  const themeId = useThemeId();
  const isVertical = orientation === LayoutDirection.Vertical;
  const isDarkTheme = themeId.includes('dark');
  const textColor = isDarkTheme ? baseTheme.metric.textLightColor : baseTheme.metric.textDarkColor;
  const resolvedTrackColor = trackColor ?? baseTheme.metric.barBackground;
  const resolvedMarkerColor = markerColor ?? textColor;
  const resolvedFillBorderColor = fillBorderColor ?? baseTheme.background.color ?? '#FFFFFF';
  const labelView = label ? (
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
              markerColor={resolvedMarkerColor}
              fillBorderColor={resolvedFillBorderColor}
              fillBorderWidth={fillBorderWidth}
              orientation={orientation}
              size={size}
              target={target}
              showZeroBaseline={showZeroBaseline}
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
            gridTemplateColumns: alignment === 'left' ? `auto ${barWidth}px` : `${barWidth}px auto`,
            gap: 12,
            alignItems: 'center',
          }}
        >
          {alignment === 'left' && labelView}
          <Meter
            value={value}
            domain={domain}
            fill={fill}
            trackColor={resolvedTrackColor}
            markerColor={resolvedMarkerColor}
            fillBorderColor={resolvedFillBorderColor}
            fillBorderWidth={fillBorderWidth}
            orientation={orientation}
            size={size}
            target={target}
            showZeroBaseline={showZeroBaseline}
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
