/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiSpacer } from '@elastic/eui';
import { boolean, text } from '@storybook/addon-knobs';
import React, { FC } from 'react';

import { Chart, Settings, Axis, Position } from '../../packages/charts/src';

const NoResults: FC<{ msg: string }> = ({ msg }) => (
  <EuiFlexItem>
    <EuiFlexGroup direction="column" alignItems="center" justifyContent="center">
      <EuiIcon type="visualizeApp" />
      <EuiSpacer size="s" />
      <p>{msg}</p>
    </EuiFlexGroup>
  </EuiFlexItem>
);

/**
 * Should render no data value
 */
export const Example = () => {
  const customNoResults = boolean('Show custom no results', true);
  const noResultsMsg = text('Custom No Results message', 'No Results');

  return (
    <Chart className="story-chart">
      <Axis id="count" title="count" position={Position.Left} />
      <Axis id="x" title="goods" position={Position.Bottom} />
      <Settings noResults={customNoResults ? <NoResults msg={noResultsMsg} /> : undefined} />
    </Chart>
  );
};
