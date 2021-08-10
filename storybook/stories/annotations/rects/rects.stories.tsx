/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_KNOBS_PANEL } from '../../utils/storybook';

export default {
  title: 'Annotations/Rects',
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};

export { Example as linearBarChart } from './1_linear_bar_chart';
export { Example as ordinalBarChart } from './2_ordinal_bar_chart';
export { Example as linearLineChart } from './3_linear_line_chart';
export { Example as styling } from './4_styling';
export { Example as tooltipOptions } from './5_tooltip_options';
export { Example as zeroDomain } from './6_zero_domain';
export { Example as withGroupId } from './7_with_group_id';
export { Example as outside } from './8_outside';
export { Example as clickHandleRectAnnotation } from './9_click_handler';
