/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMeasureContext } from './measure';

const endOfTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('getMeasureContext', () => {
  let getContext: jest.SpyInstance;

  beforeEach(() => {
    getContext = jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => ({}) as CanvasRenderingContext2D);
  });

  afterEach(() => getContext.mockRestore());

  it('shares one canvas context within a task and starts a new one in the next', async () => {
    const first = getMeasureContext();
    expect(getMeasureContext()).toBe(first);
    await endOfTask();
    const next = getMeasureContext();
    expect(next).not.toBeNull();
    expect(next).not.toBe(first);
    expect(getContext).toHaveBeenCalledTimes(2);
  });

  it('is null without canvas support', async () => {
    await endOfTask();
    getContext.mockReturnValue(null);
    expect(getMeasureContext()).toBeNull();
  });
});
