/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';

export const getLegendSizeKnob = (group?: string) => {
  const enabled = boolean('enable legend size', false, group);
  const size = enabled ? number('legend size', 200, { min: 0, step: 1 }, group) : NaN;
  return size;
};
