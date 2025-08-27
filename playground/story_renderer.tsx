/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Meta } from '@storybook/react-vite';

import { StoryDecorator } from '../.storybook/decorator';

import '../.storybook/style.scss';

/**
 * Used to wrap a story in the storybook decorator before rendering in playground
 */
export function StoryRenderer(story: Meta) {
  if (!story.component) {
    throw new Error('Component is not defined');
  }
  return StoryDecorator(story.component as any, story as any);
}
