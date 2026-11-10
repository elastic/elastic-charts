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
import { MockGlobalSpec, MockSeriesSpec } from '../../mocks/specs/specs';
import { MockStore } from '../../mocks/store/store';
import { ScaleType } from '../../scales/constants';
import { onPointerMove } from '../../state/actions/mouse';
import type { GlobalChartState } from '../../state/chart_state';

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

const NARROW_X = 'a';
const WIDE_X = 'weekday-bucket-with-a-very-long-name';

describe('xy tooltip hover sizing', () => {
  let store: Store<GlobalChartState>;
  const chartRef = createRef<HTMLDivElement>();
  let getBoundingClientRect: jest.SpyInstance;

  const hover = (position: { x: number; y: number }) => {
    act(() => {
      store.dispatch(onPointerMove({ position, time: position.x * 1000 + position.y }));
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

    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'xy-tooltip');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins(),
        MockSeriesSpec.bar({
          data: [
            { x: NARROW_X, y: 1 },
            { x: WIDE_X, y: 5 },
          ],
          xScaleType: ScaleType.Ordinal,
        }),
      ],
      store,
    );

    render(
      <Provider store={store}>
        <div ref={chartRef} />
        <Tooltip getChartContainerRef={() => chartRef} />
      </Provider>,
    );
  });

  afterEach(() => {
    getBoundingClientRect.mockRestore();
    document.querySelectorAll('.echTooltipPortal, .echAnchorMainTooltip__xy-tooltip').forEach((node) => {
      node.remove();
    });
  });

  it('shrinks from a wide bar to a narrow bar instead of keeping the first width', () => {
    hover({ x: 220, y: 150 });
    const wideTooltip = screen.getByTestId('echTooltip');
    const wideWidth = wideTooltip.getBoundingClientRect().width;
    expect(wideTooltip).toHaveTextContent(WIDE_X);
    expect(wideTooltip.style.minWidth).toBe('');

    hover({ x: 80, y: 150 });
    const narrowTooltip = screen.getByTestId('echTooltip');
    expect(narrowTooltip).toHaveTextContent(NARROW_X);
    expect(narrowTooltip).not.toHaveTextContent(WIDE_X);
    expect(narrowTooltip.getBoundingClientRect().width).toBeLessThan(wideWidth);
    expect(narrowTooltip.style.minWidth).toBe('');
  });
});
