/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Parameters as SBParameters } from '@storybook/addons';
import type { ArgTypes, Args, StoryContext as SBStoryContext } from '@storybook/react';
import type { CSSProperties, ReactElement } from 'react';
import type { StoryBackgroundParameter, BackgroundGlobals } from 'storybook-addon-background-toggle';
import type { StoryThemeParameter, ThemeGlobals } from 'storybook-addon-theme-toggle';
import type { StoryTogglesParameter, TogglesGlobals } from 'storybook-addon-toggles';

interface BackgroundsGlobals {
  backgrounds: {
    grid: boolean;
    value: string;
  }
}

/**
 * Parameter accessible at the story level
 */
export type StoryParameters = SBParameters &
  StoryThemeParameter &
  StoryBackgroundParameter &
  StoryTogglesParameter & {
    /**
     * Renders markdown content below story
     */
    markdown?: string;
    /**
     * Used to enable and style resize wrapper under `#story-root`
     */
    resize?: boolean | CSSProperties;
  };
export type StoryGlobals = ThemeGlobals & BackgroundsGlobals & TogglesGlobals;

export type StoryContext = Omit<SBStoryContext, 'globals'> & {
  /**
   * global values used across stories
   */
  globals: StoryGlobals;
  /**
   * Title of story, only valid when globals.toggles.showChartTitle is true
   */
  title?: string;
  /**
   * Description of story, only valid when globals.toggles.showChartDescription is true
   */
  description?: string;
};

type ReactReturnType = ReactElement<unknown>;

/**
 * Custom duplicate of the storybook `Story` type in order to have better types that storybook does not support.
 */
export interface ChartsStory {
  (args: Args, context: StoryContext): ReactReturnType;
  /**
   * Override the display name in the UI
   */
  storyName?: string;
  /**
   * Dynamic data that are provided (and possibly updated by) Storybook and its addons.
   * @see [Arg story inputs](https://storybook.js.org/docs/react/api/csf#args-story-inputs)
   */
  args?: Partial<Args>;
  /**
   * ArgTypes encode basic metadata for args, such as `name`, `description`, `defaultValue` for an arg. These get automatically filled in by Storybook Docs.
   * @see [Control annotations](https://github.com/storybookjs/storybook/blob/91e9dee33faa8eff0b342a366845de7100415367/addons/controls/README.md#control-annotations)
   */
  argTypes?: ArgTypes;
  /**
   * Custom metadata for a story.
   * @see [Parameters](https://storybook.js.org/docs/basics/writing-stories/#parameters)
   */
  parameters?: StoryParameters;
  /**
   * Wrapper components or Storybook decorators that wrap a story.
   *
   * Decorators defined in Meta will be applied to every story variation.
   * @see [Decorators](https://storybook.js.org/docs/addons/introduction/#1-decorators)
   */
  decorators?: unknown;
}
