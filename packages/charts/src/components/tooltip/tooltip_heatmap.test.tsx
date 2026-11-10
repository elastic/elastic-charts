/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { Provider } from 'react-redux';

import { Tooltip } from './tooltip';
import { computeChartDimensionsSelector } from '../../chart_types/heatmap/state/selectors/compute_chart_dimensions';
import { MockGlobalSpec, MockSeriesSpec } from '../../mocks/specs/specs';
import { MockStore } from '../../mocks/store/store';
import { onPointerMove } from '../../state/actions/mouse';
import { pinTooltip } from '../../state/actions/tooltip';
import type { GlobalChartState } from '../../state/chart_state';
import { isPinnableTooltip } from '../../state/selectors/can_pin_tooltip';

jest.mock('@popperjs/core', () => {
  const actual = jest.requireActual('@popperjs/core');
  return {
    ...actual,
    createPopper: () => ({
      destroy: () => {},
      update: () => Promise.resolve({}),
      forceUpdate: () => {},
      setOptions: () => Promise.resolve({}),
      state: { placement: 'right' },
    }),
  };
});

const ACTION_PROMPT = 'Right-click to show actions';
const WIDE_X = 'weekday-bucket-with-a-very-long-name';
const NARROW_Y = 'A';

describe('heatmap tooltip hover sizing', () => {
  let store: Store<GlobalChartState>;
  let cell: { x: number; y: number };
  let axis: { x: number; y: number };
  const chartRef = createRef<HTMLDivElement>();
  let getBoundingClientRect: jest.SpyInstance;

  const hover = (position: { x: number; y: number }) => {
    act(() => {
      store.dispatch(onPointerMove({ position, time: position.x * 1000 + position.y }));
    });
  };

  const pin = (pinned: boolean) => {
    act(() => {
      store.dispatch(pinTooltip({ pinned }));
    });
  };

  beforeEach(() => {
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    getBoundingClientRect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.getAttribute('data-testid') === 'echTooltip') {
        return new DOMRect(0, 0, (this.textContent ?? '').length, 20);
      }
      return originalGetBoundingClientRect.call(this);
    });

    store = MockStore.default({ width: 500, height: 300, top: 0, left: 0 }, 'heatmap-tooltip');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          theme: {
            heatmap: {
              yAxisLabel: {
                visible: true,
                width: 80,
              },
            },
          },
        }),
        MockGlobalSpec.tooltip({
          actions: [{ label: 'Go', onSelect: () => {} }],
        }),
        MockSeriesSpec.heatmap({
          data: [{ x: WIDE_X, y: NARROW_Y, value: 5 }],
        }),
      ],
      store,
    );

    const { chartDimensions } = computeChartDimensionsSelector(store.getState());
    const y = chartDimensions.top + chartDimensions.height / 2;
    cell = {
      x: chartDimensions.left + chartDimensions.width / 2,
      y,
    };
    axis = {
      x: Math.max(chartDimensions.left / 2, 1),
      y,
    };

    render(
      <Provider store={store}>
        <div ref={chartRef} />
        <Tooltip getChartContainerRef={() => chartRef} />
      </Provider>,
    );
  });

  afterEach(() => {
    getBoundingClientRect.mockRestore();
    document.querySelectorAll('.echTooltipPortal, .echAnchorMainTooltip__heatmap-tooltip').forEach((node) => {
      node.remove();
    });
  });

  it('shrinks from a wide cell to a narrow axis label and hides the pin prompt', () => {
    hover(cell);
    const tooltip = screen.getByTestId('echTooltip');
    const cellWidth = tooltip.getBoundingClientRect().width;
    expect(screen.getByText(ACTION_PROMPT)).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(WIDE_X);
    expect(tooltip.style.minWidth).toBe('');

    hover(axis);
    const axisTooltip = screen.getByTestId('echTooltip');
    const axisWidth = axisTooltip.getBoundingClientRect().width;
    expect(axisWidth).toBeLessThan(cellWidth);
    expect(screen.queryByText(ACTION_PROMPT)).not.toBeInTheDocument();
    expect(axisTooltip).toHaveTextContent(NARROW_Y);
    expect(axisTooltip).not.toHaveTextContent(WIDE_X);
    expect(axisTooltip.style.minWidth).toBe('');
  });

  it('grows from a narrow axis label to a wide cell and pins that latest width', () => {
    hover(axis);
    const axisTooltip = screen.getByTestId('echTooltip');
    const axisWidth = axisTooltip.getBoundingClientRect().width;
    expect(screen.queryByText(ACTION_PROMPT)).not.toBeInTheDocument();
    expect(axisTooltip.style.minWidth).toBe('');

    hover(cell);
    const cellTooltip = screen.getByTestId('echTooltip');
    const cellWidth = cellTooltip.getBoundingClientRect().width;
    expect(cellWidth).toBeGreaterThan(axisWidth);
    expect(screen.getByText(ACTION_PROMPT)).toBeInTheDocument();
    expect(cellTooltip.style.minWidth).toBe('');

    pin(true);
    expect(screen.queryByText(ACTION_PROMPT)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    expect(Number.parseFloat(screen.getByTestId('echTooltip').style.minWidth)).toBe(cellWidth);
  });

  it('allows pinning a cell and not a y-axis label', () => {
    hover(cell);
    expect(isPinnableTooltip(store.getState())).toBe(true);

    hover(axis);
    expect(isPinnableTooltip(store.getState())).toBe(false);
  });
});
