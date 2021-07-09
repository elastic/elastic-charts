/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_KNOBS_PANEL } from '../utils/storybook';

export default {
  title: 'Legend',
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};

export { Example as right } from './1_legend_right';
export { Example as bottom } from './2_legend_bottom';
export { Example as left } from './3_legend_left';
export { Example as top } from './4_legend_top';
export { Example as insideChart } from './13_inside_chart';
export { Example as changingSpecs } from './5_changing_specs';
export { Example as hideLegendItemsBySeries } from './6_hide_legend';
export { Example as displayValuesInLegendElements } from './7_display_values';
export { Example as legendSpacingBuffer } from './8_spacing_buffer';
export { Example as colorPicker } from './9_color_picker';
export { Example as piechart } from './10_sunburst';
export { Example as piechartRepeatedLabels } from './10_sunburst_repeated_label';
export { Example as actions } from './11_legend_actions';
export { Example as margins } from './12_legend_margins';
