/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { Color } from '../../../../common/colors';
import { fillTextColor } from '../../../../common/fill_text_color';

/** @internal */
export const BADGE_BORDER = 1;

interface BadgeProps {
  value: string;
  backgroundColor: Color;
  borderColor?: Color;
}

/** @internal */
export const Badge: React.FC<BadgeProps> = ({ value, backgroundColor, borderColor }) => {
  const highContrastColor = fillTextColor(backgroundColor, backgroundColor);
  return (
    <span className="echBadge__content" style={{ backgroundColor, borderColor }}>
      <span className="echBadge__text" style={{ color: highContrastColor.color.keyword }}>
        {value}
      </span>
    </span>
  );
};
