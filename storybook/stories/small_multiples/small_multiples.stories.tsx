/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_KNOBS_PANEL } from '../utils/storybook';

export default {
  title: 'Small Multiples (@alpha)',
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};

export { Example as verticalAreas } from './2_vertical_areas';
export { Example as verticalBars } from './4_vertical_bars';
export { Example as horizontalBars } from './4_horizontal_bars';

export { Example as gridLines } from './3_grid_lines';
export { Example as histogramBars } from './5_histogram_bars';
export { Example as heterogeneous } from './6_heterogeneous_cartesians';
export { Example as sunbursts } from './7_sunbursts';
