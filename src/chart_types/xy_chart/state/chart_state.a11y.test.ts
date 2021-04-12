/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Store, createStore } from 'redux';

import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs';
import { updateParentDimensions } from '../../../state/actions/chart_settings';
import { upsertSpec, specParsed } from '../../../state/actions/specs';
import { GlobalChartState, chartStoreReducer } from '../../../state/chart_state';
import { getCustomDescription } from './selectors/get_custom_description';
import { isDefaultDescriptionDisabled } from './selectors/is_default_description_disabled';

describe('custom description for screen readers', () => {
  let store: Store<GlobalChartState>;
  beforeEach(() => {
    const storeReducer = chartStoreReducer('chartId');
    store = createStore(storeReducer);
    store.dispatch(
      upsertSpec(
        MockSeriesSpec.bar({
          data: [
            { x: 1, y: 10 },
            { x: 2, y: 5 },
          ],
        }),
      ),
    );
    store.dispatch(upsertSpec(MockGlobalSpec.settings()));
    store.dispatch(specParsed());
    store.dispatch(updateParentDimensions({ width: 100, height: 100, top: 0, left: 0 }));
  });
  it('should test defaults', () => {
    const state = store.getState();
    const customDescriptionValue = getCustomDescription(state);
    const defaultGeneratedSeriesTypes = isDefaultDescriptionDisabled(state);
    expect(customDescriptionValue).toBeUndefined();
    expect(defaultGeneratedSeriesTypes).toBeFalse();
  });
  it('should allow user to set a custom description for chart', () => {
    store.dispatch(
      upsertSpec(
        MockGlobalSpec.settings({
          customDescription: 'This is sample Kibana data',
        }),
      ),
    );
    const state = store.getState();
    const customDescriptionValue = getCustomDescription(state);
    expect(customDescriptionValue).toBe('This is sample Kibana data');
  });
  it('should be able to disable generated descriptions', () => {
    store.dispatch(
      upsertSpec(
        MockGlobalSpec.settings({
          disableGeneratedSeriesTypes: true,
        }),
      ),
    );
    const state = store.getState();
    const disableGeneratedSeriesTypes = isDefaultDescriptionDisabled(state);
    expect(disableGeneratedSeriesTypes).toBe(true);
  });
});
