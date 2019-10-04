import { mount } from 'enzyme';
import * as React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { SpecsParser } from './specs_parser';
import { chartStoreReducer } from '../state/chart_state';

describe('Specs parser', () => {
  test('Mount and parse specs', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);

    expect(chartStore.getState().initialized).toBe(false);
    const component = (
      <Provider store={chartStore}>
        <SpecsParser />
      </Provider>
    );
    mount(component);
    expect(chartStore.getState().initialized).toBe(true);
  });
  test.skip('chart store initialized and computeChart on component update', () => {
    // const chartStore = new ChartStore();
    // const computeChart = jest.fn(
    //   (): void => {
    //     return;
    //   },
    // );
    // chartStore.computeChart = computeChart;
    // const component = mount(<SpecsRootComponent chartStore={chartStore} />);
    // component.update();
    // component.setState({ foo: 'bar' });
    // expect(chartStore.specsInitialized.get()).toBe(true);
    // expect(computeChart).toBeCalled();
  });
  test('Set initialization to false on unmount', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);
    const component = mount(
      <Provider store={chartStore}>
        <SpecsParser />
      </Provider>,
    );
    component.unmount();
    expect(chartStore.getState().initialized).toBe(false);
  });
});
