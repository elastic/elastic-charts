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
import { createStore, Store } from 'redux';

import { LineSeries } from './line_series';
import { LineAnnotation, AnnotationDomainType } from '../../../specs';
import { SpecsParser } from '../../../specs/specs_parser';
import { chartStoreReducer, GlobalChartState } from '../../../state/chart_state';

function LineAnnotationChart(props: { chartStore: Store<GlobalChartState> }) {
  return (
    <Provider store={props.chartStore}>
      <SpecsParser>
        <LineSeries
          id="line"
          data={[
            [1585126720460, 0],
            [1585126780460, 22],
            [1585126840460, 100],
            [1585126900460, 333],
            [1585126960460, 444],
          ]}
          xAccessor={0}
          yAccessors={[1]}
        />
        <LineAnnotation
          id="threshold"
          domainType={AnnotationDomainType.YDomain}
          dataValues={[{ dataValue: 120, details: 'threshold' }]}
        />
      </SpecsParser>
    </Provider>
  );
}

describe('Line annotation', () => {
  it('Should always be available on the on every render', () => {
    const storeReducer = chartStoreReducer('chart_id');
    const chartStore = createStore(storeReducer);
    const wrapper = mount(<LineAnnotationChart chartStore={chartStore} />);
    expect(chartStore.getState().specs.threshold).toBeDefined();
    wrapper.setProps({});
    expect(chartStore.getState().specs.threshold).toBeDefined();
  });
});
