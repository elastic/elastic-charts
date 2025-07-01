/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { fillTextColor } from '../../../../common/fill_text_color';

/** @internal */
export const BADGE_BORDER = 1;

interface BadgeProps {
  value: string;
  backgroundColor: string;
}

/** @internal */
export const Badge: React.FC<BadgeProps> = ({ value, backgroundColor }) => {
  const highContrastColor = fillTextColor(backgroundColor, backgroundColor);
  return (
    <span className="echBadge__content" style={{ backgroundColor }}>
      <span className="echBadge__text" style={{ color: highContrastColor.color.keyword }}>
        {value}
      </span>
    </span>
  );
};
