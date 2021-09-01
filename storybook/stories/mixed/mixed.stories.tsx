/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export default {
  title: 'Mixed Charts',
};

export { Example as barsAndLines } from './1_bars_and_lines.story';
export { Example as linesAndAreas } from './2_lines_and_areas.story';
export { Example as areasAndBars } from './3_areas_and_bars.story';
export { Example as testBarLinesLinear } from './4_test_bar.story';
export { Example as testBarLinesTime } from './5_test_bar_time.story';
export { Example as fittingFunctionsNonStackedSeries } from './6_fitting.story';
export { Example as fittingFunctionsStackedSeries } from './6_fitting_stacked.story';
export { Example as markSizeAccessor } from './7_marks.story';
