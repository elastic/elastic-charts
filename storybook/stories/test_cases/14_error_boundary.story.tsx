/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Settings, Axis, Position, BarSeries, ScaleType } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

class SimpleErrorBoundary extends React.Component<{ onError?: (error: Error) => void }, { hasError: boolean }> {
  onError?: (error: Error) => void;
  constructor(props: { onError: (error: Error) => void }) {
    super(props);
    this.onError = props.onError;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    this.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return <div id="simple-error">Error occurred</div>;
    }

    return this.props.children;
  }
}

/**
 * Should render no data value
 */
export const Example: ChartsStory = (_, { title, description }) => {
  const shouldThrow = boolean('throws error', false);

  const Series = () => {
    if (shouldThrow) {
      throw new Error('What happened???');
    }

    return (
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'A', y: 0, val: 1222 },
          { x: 'B', y: 20, val: 1222 },
          { x: 'C', y: 750, val: 1222 },
          { x: 'D', y: 854, val: 1222 },
        ]}
      />
    );
  };

  return (
    <SimpleErrorBoundary onError={action('onError')}>
      <Chart title={title} description={description}>
        <Axis id="count" title="count" position={Position.Left} />
        <Axis id="x" title="goods" position={Position.Bottom} />
        <Settings baseTheme={useBaseTheme()} />
        <Series />
      </Chart>
    </SimpleErrorBoundary>
  );
};
