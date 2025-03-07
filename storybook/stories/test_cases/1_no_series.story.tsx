/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui';
import { boolean, text } from '@storybook/addon-knobs';
import type { FC } from 'react';
import React from 'react';

import { Chart, Settings, Axis, Position } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const NoResults: FC<{ msg: string }> = ({ msg }) => (
  <EuiFlexItem>
    <EuiFlexGroup gutterSize="s" direction="column" alignItems="center" justifyContent="center">
      <EuiIcon type="visualizeApp" />
      <p>{msg}</p>
    </EuiFlexGroup>
  </EuiFlexItem>
);

/**
 * Should render no data value
 */
export const Example: ChartsStory = (_, { title, description }) => {
  const customNoResults = boolean('Show custom no results', true);
  const noResultsMsg = text('Custom No Results message', 'No Results');

  return (
    <Chart title={title} description={description}>
      <Axis id="count" title="count" position={Position.Left} />
      <Axis id="x" title="goods" position={Position.Bottom} />
      <Settings noResults={customNoResults ? <NoResults msg={noResultsMsg} /> : undefined} baseTheme={useBaseTheme()} />
    </Chart>
  );
};
