/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { subscribeToDPRChange as SubscribeToDPRChange } from './dpr_observer';

describe('subscribeToDPRChange', () => {
  let subscribeToDPRChange: typeof SubscribeToDPRChange;
  let matchMediaMock: jest.Mock;
  // Latest handler passed to addEventListener — reassigned each time setupListener fires.
  let changeHandler: (() => void) | null;

  function triggerDPRChange(newDPR = 2) {
    Object.defineProperty(window, 'devicePixelRatio', { value: newDPR, writable: true, configurable: true });
    changeHandler?.();
  }

  beforeEach(async () => {
    changeHandler = null;

    matchMediaMock = jest.fn().mockImplementation(() => ({
      addEventListener: jest.fn((_event: string, handler: () => void) => {
        changeHandler = handler;
      }),
    }));

    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true, configurable: true });
    Object.defineProperty(window, 'matchMedia', { value: matchMediaMock, writable: true, configurable: true });

    // Reset module registry so the module-level `subscribers` Set is empty.
    jest.resetModules();
    ({ subscribeToDPRChange } = await import('./dpr_observer'));
  });

  it('does not call matchMedia before any subscriber is added', () => {
    expect(matchMediaMock).not.toHaveBeenCalled();
  });

  it('calls matchMedia once when the first subscriber is added', () => {
    const unsub = subscribeToDPRChange(jest.fn());
    expect(matchMediaMock).toHaveBeenCalledTimes(1);
    unsub();
  });

  it('does not call matchMedia again for additional subscribers', () => {
    const unsub1 = subscribeToDPRChange(jest.fn());
    const unsub2 = subscribeToDPRChange(jest.fn());
    expect(matchMediaMock).toHaveBeenCalledTimes(1);
    unsub1();
    unsub2();
  });

  it('uses the current devicePixelRatio in the matchMedia query', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1.5, writable: true, configurable: true });
    const unsub = subscribeToDPRChange(jest.fn());
    expect(matchMediaMock).toHaveBeenCalledWith('(resolution: 1.5dppx)');
    unsub();
  });

  it('invokes the subscriber callback when the DPR changes', () => {
    const cb = jest.fn();
    const unsub = subscribeToDPRChange(cb);
    triggerDPRChange(2);
    expect(cb).toHaveBeenCalledTimes(1);
    unsub();
  });

  it('invokes all subscriber callbacks on a DPR change', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();
    const unsub1 = subscribeToDPRChange(cb1);
    const unsub2 = subscribeToDPRChange(cb2);
    const unsub3 = subscribeToDPRChange(cb3);
    triggerDPRChange(2);
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb3).toHaveBeenCalledTimes(1);
    unsub1();
    unsub2();
    unsub3();
  });

  it('does not invoke an unsubscribed callback', () => {
    const cb = jest.fn();
    const unsub = subscribeToDPRChange(cb);
    unsub();
    triggerDPRChange(2);
    expect(cb).not.toHaveBeenCalled();
  });

  it('only skips the unsubscribed callback, not others', () => {
    const cbKept = jest.fn();
    const cbRemoved = jest.fn();
    const unsubKept = subscribeToDPRChange(cbKept);
    const unsubRemoved = subscribeToDPRChange(cbRemoved);
    unsubRemoved();
    triggerDPRChange(2);
    expect(cbKept).toHaveBeenCalledTimes(1);
    expect(cbRemoved).not.toHaveBeenCalled();
    unsubKept();
  });

  it('re-registers the matchMedia listener after a DPR change while subscribers remain', () => {
    const unsub = subscribeToDPRChange(jest.fn());
    expect(matchMediaMock).toHaveBeenCalledTimes(1);
    triggerDPRChange(2);
    expect(matchMediaMock).toHaveBeenCalledTimes(2);
    expect(matchMediaMock).toHaveBeenLastCalledWith('(resolution: 2dppx)');
    unsub();
  });

  it('does not re-register the listener after the last subscriber unsubscribes', () => {
    const unsub = subscribeToDPRChange(jest.fn());
    unsub();
    triggerDPRChange(2);
    expect(matchMediaMock).toHaveBeenCalledTimes(1);
  });

  it('re-establishes the listener when a new subscriber is added after all have unsubscribed', () => {
    const unsub1 = subscribeToDPRChange(jest.fn());
    unsub1();
    expect(matchMediaMock).toHaveBeenCalledTimes(1);

    const cb2 = jest.fn();
    const unsub2 = subscribeToDPRChange(cb2);
    expect(matchMediaMock).toHaveBeenCalledTimes(2);

    triggerDPRChange(2);
    expect(cb2).toHaveBeenCalledTimes(1);
    unsub2();
  });

  it('notifies subscribers on multiple successive DPR changes', () => {
    const cb = jest.fn();
    const unsub = subscribeToDPRChange(cb);
    triggerDPRChange(2);
    triggerDPRChange(1.5);
    triggerDPRChange(3);
    expect(cb).toHaveBeenCalledTimes(3);
    unsub();
  });
});
