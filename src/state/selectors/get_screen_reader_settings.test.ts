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
import { DEFAULT_SETTINGS_SPEC } from '../../specs';
import { getInitialState } from '../chart_state';
import { getScreenReaderDataTableSettingsSelector } from './get_screen_reader_settings';

describe('test get screen reader settings selector', () => {
  const state = getInitialState('chart1');
  it('should return the same reference', () => {
    const defaultScreenReaderDataSettings = getScreenReaderDataTableSettingsSelector(state);
    expect(defaultScreenReaderDataSettings).toEqual(DEFAULT_SETTINGS_SPEC.dataTable);
  });
  it('showDefaultDescription should default to true', () => {
    const defaultScreenReaderShowDefaultDescriptionSetting = getScreenReaderDataTableSettingsSelector(state);
    expect(defaultScreenReaderShowDefaultDescriptionSetting.showDefaultDescription).toBeTrue();
  });
  it('should honor a description given from the consumer', () => {
    const consumerExample = {
      ...DEFAULT_SETTINGS_SPEC,
      dataTable: {
        description: 'This is a test description',
      },
    };
    const updatedState = {
      ...state,
      specs: {
        [DEFAULT_SETTINGS_SPEC.id]: consumerExample,
      },
    };
    expect(getScreenReaderDataTableSettingsSelector(updatedState).description).toBe(
      consumerExample.dataTable.description,
    );
  });
});
