/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_SOURCE_PANEL } from '../utils/storybook';

export default {
  title: 'Mixed Charts',
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};

export { Example as barsAndLines } from './1_bars_and_lines';
export { Example as linesAndAreas } from './2_lines_and_areas';
export { Example as areasAndBars } from './3_areas_and_bars';
export { Example as testBarLinesLinear } from './4_test_bar';
export { Example as testBarLinesTime } from './5_test_bar_time';
export { Example as fittingFunctionsNonStackedSeries } from './6_fitting';
export { Example as fittingFunctionsStackedSeries } from './6_fitting_stacked';
export { Example as markSizeAccessor } from './7_marks';
