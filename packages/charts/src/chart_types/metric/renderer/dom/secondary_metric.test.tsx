/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { SecondaryMetric } from './secondary_metric';
import { createChartStore } from '../../../../state/chart_state';
import type { SecondaryMetricLabelTooltipProps } from '../../specs';

const label = 'Last week';
const value = '87.20';

const renderSecondaryMetric = (ui: React.ReactElement) => {
  const store = createChartStore('tooltip-test');
  return render(<Provider store={store}>{ui}</Provider>);
};

const getSecondaryMetric = (container: HTMLElement) => {
  const metric = container.querySelector('.echSecondaryMetric');
  if (!metric) {
    throw new Error('Expected .echSecondaryMetric');
  }
  return metric;
};

describe('SecondaryMetric', () => {
  it('renders the label and value by default', () => {
    const { container } = renderSecondaryMetric(
      <SecondaryMetric value={value} label={label} badgeBorderColor={undefined} />,
    );

    expect(container.querySelector('.echSecondaryMetric__label')).toHaveTextContent(label);
    expect(container.querySelector('.echSecondaryMetric__value')).toHaveTextContent(value);
  });

  it('hides the inline label and shows it in a tooltip on hover', () => {
    const { container } = renderSecondaryMetric(
      <SecondaryMetric value={value} label={label} labelPosition="tooltip" badgeBorderColor={undefined} />,
    );
    const metric = getSecondaryMetric(container);

    expect(container.querySelector('.echSecondaryMetric__label')).not.toBeInTheDocument();
    expect(container.querySelector('.echScreenReaderOnly')).toHaveTextContent(label);
    expect(container.querySelector('.echSecondaryMetric__value')).toHaveTextContent(value);
    expect(screen.queryByTestId('echTooltipHeader')).not.toBeInTheDocument();
    fireEvent.pointerEnter(metric);
    expect(screen.getByTestId('echTooltipHeader')).toHaveTextContent(label);

    fireEvent.pointerLeave(metric);
    expect(screen.queryByTestId('echTooltipHeader')).not.toBeInTheDocument();
  });

  describe('custom labelTooltip', () => {
    const CustomLabelTooltip = ({ children, label, value, placement }: SecondaryMetricLabelTooltipProps) => (
      <div data-testid="custom-tooltip" data-label={label} data-value={value} data-placement={placement}>
        {children}
      </div>
    );

    it('wraps the secondary metric and replaces the default tooltip', () => {
      const { container } = renderSecondaryMetric(
        <SecondaryMetric
          value={value}
          label={label}
          labelPosition="tooltip"
          labelTooltip={CustomLabelTooltip}
          badgeBorderColor={undefined}
        />,
      );
      const metric = getSecondaryMetric(container);

      const wrapper = screen.getByTestId('custom-tooltip');
      expect(wrapper).toHaveAttribute('data-label', label);
      expect(wrapper).toHaveAttribute('data-value', value);

      // still focusable for keyboard-triggered tooltips and screen reader label preserved
      expect(metric).toHaveAttribute('tabindex', '0');
      expect(container.querySelector('.echScreenReaderOnly')).toHaveTextContent(label);
    });

    it('is ignored when labelPosition is not tooltip', () => {
      const { container } = renderSecondaryMetric(
        <SecondaryMetric
          value={value}
          label={label}
          labelPosition="before"
          labelTooltip={CustomLabelTooltip}
          badgeBorderColor={undefined}
        />,
      );

      expect(screen.queryByTestId('custom-tooltip')).not.toBeInTheDocument();
      expect(container.querySelector('.echSecondaryMetric__label')).toHaveTextContent(label);
    });
  });
});
