/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { SVGAttributes } from 'react';
import React, { memo } from 'react';

import { AlertIcon } from './assets/alert';
import { DotIcon } from './assets/dot';
import { DownArrowIcon } from './assets/down_arrow';
import { EmptyIcon } from './assets/empty';
import { EyeIcon } from './assets/eye';
import { EyeClosedIcon } from './assets/eye_closed';
import { ListIcon } from './assets/list';
import { QuestionInCircle } from './assets/question_in_circle';
import { deepEqual } from '../../utils/fast_deep_equal';

const typeToIconMap = {
  alert: AlertIcon,
  dot: DotIcon,
  empty: EmptyIcon,
  eye: EyeIcon,
  eyeClosed: EyeClosedIcon,
  list: ListIcon,
  questionInCircle: QuestionInCircle,
  downArrow: DownArrowIcon,
};

/** @internal */
export type IconColor = string;

/** @internal */
export type IconType = keyof typeof typeToIconMap;

interface IconProps {
  className?: string;
  'aria-label'?: string;
  'data-test-subj'?: string;
  type?: IconType;
  color?: IconColor;
}

/** @internal */
export type IconComponentProps = Omit<SVGAttributes<SVGElement>, 'color' | 'type'> & IconProps;

function IconComponent({ type, color, className, tabIndex, ...rest }: IconComponentProps) {
  let optionalCustomStyles = null;

  if (color) {
    optionalCustomStyles = { color };
  }

  const classes = classNames('echIcon', className);
  const Svg = (type && typeToIconMap[type]) || EmptyIcon;

  /*
   * This is a fix for IE and Edge, which ignores tabindex="-1" on an SVG, but respects
   * focusable="false".
   *   - If there's no tab index specified, we'll default the icon to not be focusable,
   *     which is how SVGs behave in Chrome, Safari, and FF.
   *   - If tab index is -1, then the consumer wants the icon to not be focusable.
   *   - For all other values, the consumer wants the icon to be focusable.
   */
  const focusable = tabIndex === undefined || tabIndex === -1 ? 'false' : 'true';

  return <Svg className={classes} {...optionalCustomStyles} tabIndex={tabIndex} focusable={focusable} {...rest} />;
}

IconComponent.displayName = 'Icon';

/** @internal */
export const Icon = memo(IconComponent, deepEqual);
