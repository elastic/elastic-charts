/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale } from '../../scales';
import { ScaleType } from '../../scales/constants';
import { mergePartial } from '../../utils/common';

/** @internal */
export class MockScale {
  private static readonly base: Scale<number | string> = {
    scale: jest.fn().mockImplementation((x) => x),
    type: ScaleType.Linear,
    step: 0,
    bandwidth: 0,
    bandwidthPadding: 0,
    minInterval: 0,
    barsPadding: 0,
    range: [0, 100],
    domain: [0, 100],
    ticks: jest.fn(),
    pureScale: jest.fn(),
    invert: jest.fn(),
    invertWithStep: jest.fn(),
    isSingleValue: jest.fn(),
    isValueInDomain: jest.fn(),
    isInverted: false,
  };

  static default(partial: Partial<Scale<number | string>>): Scale<number | string> {
    return mergePartial<Scale<number | string>>(MockScale.base, partial);
  }
}
