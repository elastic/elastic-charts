/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiProvider, EuiMarkdownFormat, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiText } from '@elastic/eui';
import classNames from 'classnames';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import type { DecoratorFunction } from 'storybook/internal/types';
import events from 'storybook/internal/core-events';

import type { StoryGlobals, StoryParameters } from './types';
import { ThemeId, ThemeIdProvider, BackgroundIdProvider } from '@ech/sb';

import './load_icons';
import { getThemeFromTitle } from './themes';
import type { BackgroundKey } from './backgrounds';
import { addons } from 'storybook/internal/preview-api';

const ResizeWrapper: FC<PropsWithChildren<{ resize: StoryParameters['resize'] }>> = ({ resize, children }) =>
  resize ? (
    <div id="story-resize-wrapper" style={resize === true ? {} : resize}>
      {children}
    </div>
  ) : (
    <>{children}</>
  );

export const StoryDecorator: DecoratorFunction = (Story, context) => {
  if (!Story) return <div>No Story</div>;

  const globals = (context.globals as StoryGlobals) ?? {};

  const parameters = (context.parameters as StoryParameters) ?? {};

  const themeId = getThemeFromTitle(globals.theme) ?? ThemeId.Light;
  const backgroundId = globals.backgrounds.value as BackgroundKey;
  const {
    showHeader = false,
    showChartTitle = false,
    showChartDescription = false,
    showChartBoundary = false,
  } = globals.toggles ?? {};
  const { markdown, resize } = parameters;
  const colorMode = themeId.includes('light') ? 'light' : 'dark';

  const channel = addons.getChannel();

  // useEffect(() => {
  //   const event = events.ARGTYPES_INFO_REQUEST
  //   channel.on(event, (payload) => {
  //     console.log(event, payload);
  //   });
  // }, [])
  useEffect(() => {
    const eventss = [
      events.ARGTYPES_INFO_REQUEST,
      events.ARGTYPES_INFO_RESPONSE,
      events.STORY_ARGS_UPDATED,
      events.RESET_STORY_ARGS,
      events.UPDATE_STORY_ARGS,
    ]
    Object.values(eventss).forEach((event) => {
      channel.on(event, (payload) => {
        console.log(event, payload);
      });
    });
  }, [])

  return (
    <EuiProvider colorMode={colorMode}>
      <ThemeIdProvider value={themeId}>
        <BackgroundIdProvider value={backgroundId}>
          <EuiFlexGroup gutterSize="none" direction="column" responsive={false}>
            {showHeader && !showChartTitle && !showChartDescription && (
              <EuiFlexItem className="story-header" grow={false}>
                <EuiFlexGroup gutterSize="none" direction="column" responsive={false}>
                  <EuiFlexItem>
                    <EuiText>
                      <h1 style={{ fontWeight: 200 }}>{context.title}</h1>
                    </EuiText>
                  </EuiFlexItem>

                  <EuiFlexItem>
                    <EuiText>
                      <h2 style={{ fontWeight: 400 }}>{context.name}</h2>
                    </EuiText>
                  </EuiFlexItem>

                  <EuiHorizontalRule />
                </EuiFlexGroup>
              </EuiFlexItem>
            )}

            <EuiFlexItem grow={false}>
              <div
                id="story-root"
                className={classNames({
                  showChartBoundary,
                  resizeHeight: (resize as CSSProperties)?.height === undefined,
                })}
              >
                <ResizeWrapper resize={resize}>
                  <Story
                    {...context}
                    chartProps={{
                      title: showChartTitle ? context.title : undefined,
                      description: showChartDescription ? context.name : undefined,
                    }}
                  />
                </ResizeWrapper>
              </div>
            </EuiFlexItem>
            {markdown && (
              <EuiFlexItem className="markdown">
                <EuiMarkdownFormat>{markdown}</EuiMarkdownFormat>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </BackgroundIdProvider>
      </ThemeIdProvider>
    </EuiProvider>
  );
};
