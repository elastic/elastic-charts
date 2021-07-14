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
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
} from '@elastic/eui';
import { DecoratorFunction } from '@storybook/addons';
import React from 'react';

export const StoryWrapper: DecoratorFunction<JSX.Element> = (Story, context) => {
  return (
    <div id="wrapper">
      <EuiPage paddingSize="none">
        <EuiPageBody paddingSize="none">
          <EuiPageHeader restrictWidth pageTitle={context.kind} description={context.name} paddingSize="l">
            <EuiHorizontalRule />
          </EuiPageHeader>

          <EuiPageContent
            hasBorder={false}
            hasShadow={false}
            paddingSize="none"
            borderRadius="none"
            color="transparent"
          >
            <EuiPageContentBody restrictWidth>
              <EuiFlexGroup gutterSize="none" direction="column" responsive={false}>
                <EuiFlexItem grow={false}>
                  <div id="story-wrapper">
                    <Story />
                  </div>
                </EuiFlexItem>

                <EuiFlexItem style={{ padding: 24 }}>
                  <EuiMarkdownFormat>{context?.parameters?.docs?.description.story}</EuiMarkdownFormat>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </div>
  );
};
