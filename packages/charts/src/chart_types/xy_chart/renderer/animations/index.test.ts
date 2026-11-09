/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTransitionAnimationContext } from '.';
import type { Painter } from '../../../../renderers/painter';

describe('getTransitionAnimationContext', () => {
  const painter = { transition: null } as unknown as Painter;
  const { getValue } = getTransitionAnimationContext(painter);

  it('returns the target value and hands the painter the transition to it', () => {
    expect(getValue({ duration: 'fast', delay: 10, timeFunction: 'easeIn' })('key', 0.5)).toBe(0.5);
    expect(painter.transition).toEqual({ duration: 150, delay: 10, timeFunction: 'easeIn' });
  });

  it('defaults to a slow linear transition', () => {
    getValue()('key', 0.2);
    expect(painter.transition).toEqual({ duration: 350, delay: 0, timeFunction: 'linear' });
  });

  it('does not transition to a snapped value, nor when disabled', () => {
    getValue({ snapValues: [1] })('key', 1);
    expect(painter.transition).toBeNull();
    getValue({ enabled: false })('key', 0.2);
    expect(painter.transition).toBeNull();
  });
});
