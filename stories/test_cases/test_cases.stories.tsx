/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_SOURCE_PANEL } from '../utils/storybook';

export default {
  title: 'Test Cases',
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};

export { Example as noSeries } from './1_no_series';
export { Example as chromePathBugFix } from './2_chrome_path_bug_fix';
export { Example as noAxesAnnotationBugFix } from './3_no_axes_annotation';
export { Example as filterZerosInLogFitDomain } from './4_filter_zero_values_log';
export { Example as legendScrollBarSizing } from './5_legend_scroll_bar_sizing';
export { Example as accessibilityCustomizations } from './6_a11y_custom_description';
