/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiProvider, EuiMarkdownFormat, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiText } from '@elastic/eui';
import { DecoratorFunction } from '@storybook/addons';
import classNames from 'classnames';
import React, { CSSProperties, FC, PropsWithChildren } from 'react';

import { StoryGlobals, StoryParameters } from './types';
import { ThemeId, ThemeIdProvider, BackgroundIdProvider } from './use_base_theme';

const ResizeWrapper: FC<PropsWithChildren<{ resize: StoryParameters['resize'] }>> = ({ resize, children }) =>
  resize ? (
    <div id="story-resize-wrapper" style={resize === true ? {} : resize}>
      {children}
    </div>
  ) : (
    <>{children}</>
  );

export const StoryWrapper: DecoratorFunction<JSX.Element> = (Story, context) => {
  if (!Story) return <div>No Story</div>;

  const globals = (context.globals as StoryGlobals) ?? {};
  const parameters = (context.parameters as StoryParameters) ?? {};

  const themeId = (globals.theme as ThemeId) ?? ThemeId.Light;
  const backgroundId = globals.background;
  const {
    showHeader = false,
    showChartTitle = false,
    showChartDescription = false,
    showChartBoundary = false,
  } = globals.toggles ?? {};
  const { markdown, resize } = parameters;
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
              <div
                id="story-root"
                className={classNames({
                  showChartBoundary,
                  resizeHeight: (resize as CSSProperties).height === undefined,
                })}
              >
                <ResizeWrapper resize={resize}>
                  <Story
                    {...context}
                    title={showChartTitle ? context.kind : undefined}
                    description={showChartDescription ? context.name : undefined}
                  />
                </ResizeWrapper>
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
