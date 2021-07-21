/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  EuiMarkdownFormat,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiText,
} from '@elastic/eui';
import { DecoratorFunction } from '@storybook/addons';
import React from 'react';

import { ThemeName, ThemeProvider, BackgroundProvider } from './use_base_theme';

export const StoryWrapper: DecoratorFunction<JSX.Element> = (Story, context) => {
  if (!Story) return <div>No Story</div>;

  const themeName = context.globals?.themes?.value ?? ThemeName.Light;
  const backgroundColor = context.globals?.backgrounds?.value;
  const markdown = context?.parameters?.docs?.description?.story;

  return (
    <ThemeProvider value={themeName}>
      <BackgroundProvider value={backgroundColor}>
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
                  <h2  style={{ fontWeight: 500 }}>{context.name}</h2>
                </EuiText>
              </EuiFlexItem>

              <EuiHorizontalRule />

            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <div id="story-root">
              <Story />
            </div>
          </EuiFlexItem>

          {
            markdown && (
              <EuiFlexItem style={{ padding: 24 }}>
                <EuiMarkdownFormat>{markdown}</EuiMarkdownFormat>
              </EuiFlexItem>
            )
          }
        </EuiFlexGroup>
      </BackgroundProvider>
    </ThemeProvider>
  );
};
