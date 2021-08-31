/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_KNOBS_PANEL } from '../../utils/storybook';

export default {
  title: 'Annotations/Lines',
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};

export { Example as xContinuousDomain } from './1_x_continuous.story';
export { Example as xOrdinalDomain } from './2_x_ordinal.story';
export { Example as xTimeDomain } from './3_x_time.story';
export { Example as yDomain } from './4_y_domain.story';
export { Example as styling } from './5_styling.story';
export { Example as tooltipOptions } from './7_tooltip_options.story';
export { Example as advancedMarkers } from './8_advanced_markers.story';

// for testing
export { Example as singleBarHistogram } from './6_test_single_bar_histogram.story';
