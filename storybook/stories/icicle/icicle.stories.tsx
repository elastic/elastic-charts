/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SB_SOURCE_PANEL } from '../utils/storybook';

export default {
  title: 'Flame (@alpha)',
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};

export { Example as cpuProfileFlameChart } from './03_cpu_profile_flame.story';
export { Example as flameChart } from './02_unix_flame.story';
export { Example as icicleChart } from './01_unix_icicle.story';
