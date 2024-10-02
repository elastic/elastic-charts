/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { DEFAULT_SETTINGS_SPEC } from './constants';
import { SpecsParser } from './specs_parser';
import { BarSeries } from '../chart_types/specs';
import { BarSeriesSpec } from '../chart_types/xy_chart/utils/specs';
import { ChartContainer } from '../components/chart_container';
import { updateParentDimensions } from '../state/actions/chart_settings';
import { chartStoreReducer } from '../state/chart_state';

describe('Specs parser', () => {
  test('can mount the spec parser', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);

    expect(chartStore.getState().specsInitialized).toBe(false);
    const component = (
      <Provider store={chartStore}>
        <SpecsParser />
      </Provider>
    );
    mount(component);
    expect(chartStore.getState().specsInitialized).toBe(true);
  });
  test('can parse few components', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);

    expect(chartStore.getState().specsInitialized).toBe(false);
    const component = (
      <Provider store={chartStore}>
        <SpecsParser>
          <BarSeries
            id="bars"
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [0, 1],
              [1, 2],
            ]}
          />
          <BarSeries
            id="bars"
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [0, 1],
              [1, 2],
            ]}
          />
          <BarSeries
            id="bars2"
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [0, 1],
              [1, 2],
            ]}
          />
        </SpecsParser>
      </Provider>
    );
    mount(component);
    const state = chartStore.getState();
    expect(state.specsInitialized).toBe(true);
    expect(Object.keys(state.specs)).toEqual([DEFAULT_SETTINGS_SPEC.id, 'bars', 'bars2']);
    expect(state.specs.bars).toBeDefined();
    expect(state.specs.bars2).toBeDefined();
  });
  test('can update a component', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);

    expect(chartStore.getState().specsInitialized).toBe(false);
    const component = (
      <Provider store={chartStore}>
        <SpecsParser>
          <BarSeries
            id="bars"
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [0, 1],
              [1, 2],
            ]}
          />
        </SpecsParser>
      </Provider>
    );
    const wrapper = mount(component);

    wrapper.setProps({
      children: (
        <SpecsParser>
          <BarSeries
            id="bars"
            xAccessor={1}
            yAccessors={[1]}
            data={[
              [0, 1],
              [1, 2],
            ]}
          />
        </SpecsParser>
      ),
    });
    const state = chartStore.getState();
    expect((state.specs.bars as BarSeriesSpec).xAccessor).toBe(1);
  });
  test('should remove a spec when replaced with a new', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);

    expect(chartStore.getState().specsInitialized).toBe(false);
    const component = (
      <Provider store={chartStore}>
        <SpecsParser>
          <BarSeries
            id="one"
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [0, 1],
              [1, 2],
            ]}
          />
        </SpecsParser>
      </Provider>
    );
    const wrapper = mount(component);

    expect(chartStore.getState().specs.one).toBeDefined();

    wrapper.setProps({
      children: (
        <SpecsParser>
          <BarSeries
            id="two"
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [0, 4],
              [1, 6],
            ]}
          />
        </SpecsParser>
      ),
    });
    const state = chartStore.getState();
    expect(state.specs.one).toBeUndefined();
    expect(state.specs.two).toBeDefined();
  });
  test('set initialization to false on unmount', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);
    const component = mount(
      <Provider store={chartStore}>
        <SpecsParser />
      </Provider>,
    );
    component.unmount();
    expect(chartStore.getState().specsInitialized).toBe(false);
  });

  test('correctly set the rendered status', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);

    expect(chartStore.getState().specsInitialized).toBe(false);
    const chartContainerRef: React.RefObject<HTMLDivElement> = React.createRef();
    const getChartContainerRef = () => chartContainerRef;
    const chartStageRef: React.RefObject<HTMLCanvasElement> = React.createRef();

    const component = (
      <Provider store={chartStore}>
        <SpecsParser>
          <BarSeries
            id="bars"
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [0, 1],
              [1, 2],
            ]}
          />
        </SpecsParser>
        <ChartContainer getChartContainerRef={getChartContainerRef} forwardStageRef={chartStageRef} />
      </Provider>
    );
    mount(component);
    const state = chartStore.getState();
    expect(state.specsInitialized).toBe(true);
    expect(state.parentDimensions).toEqual({ width: 0, height: 0, top: 0, left: 0 });
    chartStore.dispatch(updateParentDimensions({ width: 100, height: 100, top: 0, left: 0 }));
    expect(chartStore.getState().parentDimensions).toEqual({ width: 100, height: 100, top: 0, left: 0 });
    // passing the same parent dimmesion again can be triggered by the ResizeObserver
    chartStore.dispatch(updateParentDimensions({ width: 100, height: 100, top: 0, left: 0 }));
    expect(chartStore.getState().chartRendered).toBe(true);

    // trigger also with just differences in top/left
    chartStore.dispatch(updateParentDimensions({ width: 100, height: 100, top: 1, left: 1 }));
    expect(chartStore.getState().chartRendered).toBe(true);
  });
});
