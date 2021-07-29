/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_SOURCE_PANEL } from '../utils/storybook';

export default {
  title: 'Rotations',
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};

export { Example as withOrdinalAxis } from './1_ordinal';
export { Example as negative90DegreeOrdinal } from './2_negative_ordinal';
export { Example as rotations0DegOrdinal } from './3_rotations_ordinal';
export { Example as rotations90DegOrdinal } from './4_90_ordinal';
export { Example as rotations180DegOrdinal } from './5_180_ordinal';
export { Example as negative90DegLinear } from './6_negative_linear';
export { Example as rotations0DegLinear } from './7_rotations_linear';
export { Example as rotations90DegLinear } from './8_90_deg_linear';
export { Example as rotations180DegLinear } from './9_180_deg_linear';
