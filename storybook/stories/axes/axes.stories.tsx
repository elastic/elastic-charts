/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_KNOBS_PANEL } from '../utils/storybook';

export default {
  title: 'Axes',
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};

export { Example as basic } from './1_basic';
export { Example as tickLabelRotation } from './2_tick_label_rotation';
export { Example as with4Axes } from './3_axis_4_axes';
export { Example as multiAxes } from './4_multi_axis';
export { Example as barsAndLines } from './5_multi_axis_bar_lines';
export { Example as differentTooltip } from './6_different_tooltip';
export { Example as differentTooltipFormatter } from './6a_different_tooltip_formatter';
export { Example as manyTickLabels } from './7_many_tick_labels';
export { Example as customDomain } from './8_custom_domain';
export { Example as customMixed } from './9_custom_mixed_domain';
export { Example as oneDomainBound } from './10_one_domain_bound';
export { Example as fitDomain } from './11_fit_domain_extent';
export { Example as duplicateTicks } from './12_duplicate_ticks';
export { Example as labelFormatting } from './13_label_formatting';
