/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import type { Color } from '../../../../common/colors';
import { fillTextColor } from '../../../../common/fill_text_color';

/** @internal */
export const BADGE_BORDER = 1;

interface BadgeProps {
  /** Additional CSS class name for the badge container */
  className?: string;
  /** Text content to display in the badge */
  value: string;
  /** Background color of the badge */
  backgroundColor: Color;
  /** Optional border color (undefined = no border) */
  borderColor?: Color;
}

/** @internal */
export const Badge: React.FC<BadgeProps> = ({ className, value, backgroundColor, borderColor }) => {
  const classes = classNames('echBadge__content', className);
  const highContrastColor = fillTextColor(backgroundColor, backgroundColor);
  return (
    <span className={classes} style={{ backgroundColor, borderColor }}>
      <span className="echBadge__text" style={{ color: highContrastColor.color.keyword }}>
        {value}
      </span>
    </span>
  );
};
