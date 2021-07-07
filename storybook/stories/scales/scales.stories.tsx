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

import { SB_KNOBS_PANEL } from '../utils/storybook';

export default {
  title: 'Scales',
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};

export { Example as timezoneConfiguration } from './1_different_timezones';
export { Example as tooltipInLocalTimezone } from './2_local_tooltip';
export { Example as tooltipInUTC } from './3_utc_tooltip';
export { Example as specifiedTimezone } from './4_specified_timezone';
export { Example as removeDuplicateAxis } from './5_remove_duplicates';
export { Example as xScaleFallback } from './6_x_scale_fallback';
export { Example as logScaleOptions } from './7_log_scale_options';
