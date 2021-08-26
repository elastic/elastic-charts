/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { storybookParameters } from './parameters';
import { preloadIcons } from './preload_icons';
import { StoryWrapper } from './story_wrapper';

import './style.scss';

if (process.env.VRT) {
  preloadIcons();
  document.querySelector('html')?.classList.add('disable-animations');
}

export const parameters = storybookParameters;
export const decorators = [StoryWrapper];
