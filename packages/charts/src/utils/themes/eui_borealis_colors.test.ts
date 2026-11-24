/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import * as generated from './eui_borealis_colors.generated';
// eslint-disable-next-line import/no-restricted-paths
import { extractEuiColors } from '../../../scripts/extract_eui_colors';

describe('EUI Borealis colors', () => {
  it('matches the installed @elastic/eui-theme-borealis (run `yarn generate:eui-colors` in packages/charts)', () => {
    expect({ ...generated }).toEqual(extractEuiColors());
  });
});
