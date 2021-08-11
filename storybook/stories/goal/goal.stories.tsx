/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_SOURCE_PANEL } from '../utils/storybook';

export default {
  title: 'Goal (@alpha)',
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};

export { Example as gaugeWithTarget } from './2_gauge_with_target';
export { Example as horizontalBullet } from './3_horizontal_bullet';
export { Example as verticalBullet } from './4_vertical_bullet';
export { Example as minimalGoal } from './5_minimal';
export { Example as minimalHorizontal } from './6_minimal_horizontal';
export { Example as horizontalBar } from './7_horizontal_bar';
export { Example as irregularTicks } from './8_irregular_ticks';
export { Example as minimalBand } from './9_minimal_band';
export { Example as bandInBand } from './10_band_in_band';
export { Example as gaps } from './11_gaps';
export { Example as range } from './12_range';
export { Example as confidenceLevel } from './13_confidence_level';
export { Example as third } from './14_one_third';
export { Example as halfCircle } from './15_half_circle';
export { Example as twoThirds } from './16_two_thirds';
export { Example as threeQuarters } from './17_three_quarters';
export { Example as fullCircle } from './17_total_circle';
export { Example as smallGap } from './17_very_small_gap';
export { Example as sideGauge } from './18_side_gauge';
export { Example as sideGaugeInverted } from './18_side_gauge_inverted_angle_relation';
export { Example as horizontalNegative } from './19_horizontal_negative';
export { Example as verticalNegative } from './20_vertical_negative';
export { Example as goalNegative } from './21_goal_negative';
export { Example as horizontalPlusMinus } from './22_horizontal_plusminus';
export { Example as verticalPlusMinus } from './23_vertical_plusminus';
export { Example as goalPlusMinus } from './24_goal_plusminus';
export { Example as goalSemantics } from './25_goal_semantic';
