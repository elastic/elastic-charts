/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiMarkdownFormat, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiText } from '@elastic/eui';
import { DecoratorFunction } from '@storybook/addons';
import React, { useMemo } from 'react';

import { ElasticChartsProvider } from '@elastic/charts';

import { getContext, ThemeId } from './context_utils';

export const StoryWrapper: DecoratorFunction<JSX.Element> = (Story, context) => {
  const themeId = context.globals?.theme ?? ThemeId.Light;
  const backgroundId = context.globals?.background;
  const markdown = context?.parameters?.markdown;
  const contextValue = useMemo(() => getContext(themeId, backgroundId), [themeId, backgroundId]);

  if (!Story) return <div>No Story</div>;

  return (
    <ElasticChartsProvider value={contextValue}>
      <EuiFlexGroup gutterSize="none" direction="column" responsive={false}>
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

        <EuiFlexItem grow={false}>
          <div id="story-root">
            <Story {...context} />
          </div>
        </EuiFlexItem>

        {markdown && (
          <EuiFlexItem style={{ padding: 24 }}>
            <EuiMarkdownFormat>{markdown}</EuiMarkdownFormat>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </ElasticChartsProvider>
  );
};
