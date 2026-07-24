/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { colorToRgba } from '../../../common/color_library_wrappers';
import type { BrushStyle } from '../../../utils/themes/theme';

/** Geometry of the brush rubber-band overlay (CSS coordinates, DPR-agnostic). */
export interface BrushOverlayProps {
  overlay: { x: number; width: number; top: number; height: number };
  brushTheme: BrushStyle;
}

/**
 * CSS div rubber-band drawn over the canvas while the user is brushing (ADR 0009).
 * Styled from `theme.brush` for visual consistency with XY brush and dark-mode support.
 * pointerEvents:none passes input through to the canvas underneath.
 * @internal
 */
export function BrushOverlay({ overlay, brushTheme }: BrushOverlayProps): React.ReactElement {
  const [r, g, b] = colorToRgba(brushTheme.fill);
  return (
    <div
      style={{
        position: 'absolute',
        left: overlay.x,
        top: overlay.top,
        width: overlay.width,
        height: overlay.height,
        backgroundColor: `rgba(${r},${g},${b},${brushTheme.opacity})`,
        border: `${brushTheme.strokeWidth}px solid ${brushTheme.stroke}`,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    />
  );
}
