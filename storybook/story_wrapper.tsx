/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiProvider, EuiMarkdownFormat, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiText } from '@elastic/eui';
import { DecoratorFunction } from '@storybook/addons';
import React from 'react';

import { ThemeId, ThemeIdProvider, BackgroundIdProvider } from './use_base_theme';

export const StoryWrapper: DecoratorFunction<JSX.Element> = (Story, context) => {
  if (!Story) return <div>No Story</div>;

  const { globals, parameters } = context;

  const themeId = globals?.theme ?? ThemeId.EUILight;
  const backgroundId = globals?.background;
  const { showHeader = false, showChartTitle = false, showChartDescription = false } = globals?.toggles ?? {};
  const markdown = parameters?.markdown;
  const colorMode = themeId.includes('light') ? 'light' : 'dark';

  return (
    <EuiProvider colorMode={colorMode}>
      <ThemeIdProvider value={themeId}>
        <BackgroundIdProvider value={backgroundId}>
          <EuiFlexGroup gutterSize="none" direction="column" responsive={false}>
            {showHeader && !showChartTitle && !showChartDescription && (
              <EuiFlexItem id="story-header" grow={false}>
                <EuiFlexGroup gutterSize="none" direction="column" responsive={false}>
                  <EuiFlexItem>
                    <EuiText>
                      <h1 style={{ fontWeight: 200 }}>{context.kind}</h1>
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
              <div id="story-root">
                <Story
                  {...context}
                  title={showChartTitle ? context.kind : undefined}
                  description={showChartDescription ? context.name : undefined}
                />
              </div>
            </EuiFlexItem>
            {markdown && (
              <EuiFlexItem style={{ padding: 24 }}>
                <EuiMarkdownFormat>{markdown}</EuiMarkdownFormat>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </BackgroundIdProvider>
      </ThemeIdProvider>
    </EuiProvider>
  );
};
