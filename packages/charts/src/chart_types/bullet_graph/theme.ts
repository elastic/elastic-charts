/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../common/colors';
import { Pixels } from '../../common/geometry';

/** @public */
export interface BulletGraphStyle {
  text: {
    darkColor: Color;
    lightColor: Color;
  };
  border: Color;
  background: Color;
  barBackground: Color;
  nonFiniteText: string;
  minHeight: Pixels;
}

/** @internal */
export const LIGHT_THEME_BULLET_STYLE: BulletGraphStyle = {
  text: {
    lightColor: '#E0E5EE',
    darkColor: '#343741',
  },
  border: '#EDF0F5',
  barBackground: '#343741',
  background: '#FFFFFF',
  nonFiniteText: 'N/A',
  minHeight: 64,
};

/** @internal */
export const DARK_THEME_BULLET_STYLE: BulletGraphStyle = {
  text: {
    lightColor: '#E0E5EE',
    darkColor: '#343741',
  },
  border: '#343741',
  barBackground: '#343741',
  background: '#1D1E23',
  nonFiniteText: 'N/A',
  minHeight: 64,
};
