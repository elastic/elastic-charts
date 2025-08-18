/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { Chart } from './chart';

type Props = PropsWithChildren<{ onError?: (error: Error) => void }>;
type State = { hasError: boolean };

class SimpleErrorBoundary extends React.Component<Props, State> {
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

describe('Error boundary', () => {
  it('should render error boundary when error thrown inside chart', () => {
    const onError = jest.fn();
    const Series = () => {
      throw new Error('What happened???');
    };

    const wrapper = mount(
      <SimpleErrorBoundary onError={onError}>
        <Chart size={[100, 100]} id="chart1">
          <Series />
        </Chart>
      </SimpleErrorBoundary>,
    );
    const errorEl = wrapper.find('#simple-error');
    const chartEl = wrapper.find('.echChart');

    expect(errorEl.exists()).toBe(true);
    expect(chartEl.exists()).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'What happened???',
      }),
    );
  });
});
