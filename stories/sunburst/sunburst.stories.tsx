/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_SOURCE_PANEL } from '../utils/storybook';

export default {
  title: 'Sunburst',
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};

export { Example as mostBasic } from './1_simple';
export { Example as valueFormatted } from './2_value_formatted';
export { Example as valueFormattedWithCategoricalColorPalette } from './3_value_formatted_2';
export { Example as withFillLabels } from './4_fill_labels';
export { Example as donutChartWithFillLabels } from './5_donut';
export { Example as withDirectTextLabels } from './6_pie_chart_labels';
export { Example as withLinkedTextLabels } from './6_pie_chart_linked_labels';
export { Example as someZeroValueSlice } from './7_zero_slice';
export { Example as sunburstWithTwoLayers } from './8_sunburst_two_layers';
export { Example as sunburstWithThreeLayers } from './9_sunburst_three_layers';

export { Example as withTwoSlices } from './10_2_slice';
export { Example as largeAndSmallSlices } from './11_small_large';
export { Example as veryLargeAndSmall } from './12_very_small';
export { Example as nearFullNearEmpty } from './13_empty';
export { Example as fullAndZeroSlices } from './14_full_zero';
export { Example as singleSlice } from './15_single';
export { Example as singleSunburst } from './15_single_sunburst';
export { Example as singleSmallSice } from './16_single_small';
export { Example as singleVerySmall } from './17_single_very_small';
export { Example as noSlice } from './18_no_sliced';
export { Example as negative } from './19_negative';

export { Example as totalZero } from './20_total_zero';
export { Example as highNumberOfSlices } from './21_high_pie';
export { Example as counterClockwiseSpecial } from './22_counter_clockwise';
export { Example as clockwiseNoSpecial } from './23_clockwise';
export { Example as linkedLabelsOnly } from './24_linked_label';
export { Example as noLabels } from './25_no_labels';
export { Example as percentage } from './26_percentage';
export { Example as heterogeneous } from './27_heterogeneous_depth';
export { Example as notANumber } from './28_not_a_number';
export { Example as customStroke } from './29_custom_stroke';
export { Example as largestCircle } from './30_largest_circle';
export { Example as boldLinkValue } from './31_bold_link_value';
export { Example as customTooltip } from './32_custom_tooltip';
export { Example as orderedSlices } from './33_ordered_slices';
