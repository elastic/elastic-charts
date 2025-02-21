/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Placement as PopperPlacement } from '@popperjs/core/lib/enums';
import type { CSSProperties } from 'react';

import type { TooltipStyle } from '../../utils/themes/theme';

/** @internal */
export function getStylesFromPlacement(
  actionable: boolean,
  { maxWidth }: TooltipStyle,
  placement?: PopperPlacement,
): CSSProperties | undefined {
  if (!actionable) return { maxWidth };
  switch (placement) {
    case 'left':
    case 'left-start':
    case 'left-end':
    case 'top-end':
    case 'bottom-end':
      return {
        maxWidth,
        justifyContent: 'flex-end',
      };
    case 'right':
    case 'right-start':
    case 'right-end':
    case 'top-start':
    case 'bottom-start':
      return {
        maxWidth,
        justifyContent: 'flex-start',
      };
    case 'top':
    case 'bottom':
      return {
        maxWidth,
        justifyContent: 'center',
      };
    case 'auto':
    case 'auto-start':
    case 'auto-end':
    default:
      return {
        maxWidth,
      };
  }
}
