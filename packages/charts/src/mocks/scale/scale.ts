/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ScaleContinuous } from '../../scales';
import { ScaleType } from '../../scales/constants';
import { mergePartial } from '../../utils/common';

/** @internal */
export class MockScale {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private static readonly base: ScaleContinuous = {
    project: jest.fn(),
    inverseProject: jest.fn(),
    isSingleValueHistogram: false,
    linearBase: 0,
    tickValues: [],
    timeZone: '',
    totalBarsInCluster: 0,
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

  static default(partial: Partial<ScaleContinuous>): ScaleContinuous {
    return mergePartial<ScaleContinuous>(MockScale.base, partial);
  }
}
