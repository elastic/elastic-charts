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

const ICON_MARGIN = 4;

interface BadgeProps {
  /** Additional CSS class name for the badge container */
  className?: string;
  /** Text content to display in the badge */
  value: string;
  /** Background color of the badge */
  backgroundColor: Color;
  /** Optional border color (undefined = no border) */
  borderColor?: Color;
  /** Optional icon to display with priority over text */
  icon?: string;
  /** Icon position: 'before' or 'after' */
  iconPosition?: 'before' | 'after';
}

/** @internal */
export const Badge: React.FC<BadgeProps> = ({
  className,
  value,
  backgroundColor,
  borderColor,
  icon,
  iconPosition = 'after',
}) => {
  const classes = classNames('echBadge__content', className);
  const highContrastColor = fillTextColor(backgroundColor, backgroundColor);

  const iconStyles =
    value !== ''
      ? {
          [iconPosition === 'before' ? 'marginInlineEnd' : 'marginInlineStart']: icon ? ICON_MARGIN : undefined,
        }
      : undefined;
  const optionalIcon = icon ? <span style={iconStyles}>{icon}</span> : null;

  return (
    <span className={classes} style={{ backgroundColor, borderColor, color: highContrastColor.color.keyword }}>
      {iconPosition === 'before' && optionalIcon}
      <span className="echBadge__text">{value}</span>
      {iconPosition === 'after' && optionalIcon}
    </span>
  );
};
