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

import { useBaseTheme } from '../../../use_base_theme';

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

interface MeterPreviewProps extends Pick<MeterProps, 'domain' | 'orientation' | 'size' | 'target'> {
  title: string;
  label: string;
  value: number;
  fill: MeterFill;
  alignment?: 'left' | 'right';
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
  alignment = 'right',
}: MeterPreviewProps) {
  const baseTheme = useBaseTheme();
  const isVertical = orientation === LayoutDirection.Vertical;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ color: baseTheme.metric.textDarkColor, fontSize: 12, fontWeight: 600 }}>{title}</div>
      <div
        style={{
          position: 'relative',
          width: isVertical ? 24 : 320,
          height: isVertical ? 160 : 20,
        }}
      >
        <Meter
          value={value}
          domain={domain}
          fill={fill}
          trackColor={baseTheme.metric.barBackground}
          markerColor={baseTheme.metric.textDarkColor}
          fillBorderColor={baseTheme.background.color ?? '#FFFFFF'}
          fillBorderWidth={2}
          orientation={orientation}
          size={size}
          target={target}
          ariaLabel={title}
          ariaValueText={label}
          style={isVertical ? { margin: '0 auto' } : { width: '100%' }}
        />
        {!isVertical && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: alignment === 'left' ? 'flex-start' : 'flex-end',
              padding: '0 8px',
              pointerEvents: 'none',
              color: baseTheme.metric.textDarkColor,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export function StoryShell({ children }: { children: React.ReactNode }) {
  const baseTheme = useBaseTheme();

  return (
    <div
      data-test-subj="echMeterStory"
      style={{
        display: 'grid',
        gap: 24,
        width: 'fit-content',
        minWidth: 420,
        padding: 24,
        backgroundColor: baseTheme.background.color ?? '#FFFFFF',
      }}
    >
      {children}
    </div>
  );
}
