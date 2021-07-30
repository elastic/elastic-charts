/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_SOURCE_PANEL } from '../utils/storybook';

export default {
  title: 'Treemap',
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};

export { Example as oneLayer } from './1_one_layer';
export { Example as oneLayer2 } from './2_one_layer_2';
export { Example as midTwoLayers } from './3_mid_two';
export { Example as twoLayersStressTest } from './4_two_layer_stress';
export { Example as multiColor } from './5_multicolor';
export { Example as customStyle } from './6_custom_style';
export { Example as percentage } from './7_percentage';
export { Example as grooveText } from './8_groove_text';
export { Example as zeroValues } from './9_zero_values';
export { Example as threeLayer } from './10_three_layers';
