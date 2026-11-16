/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const withAnimation = (renderer: FrameRequestCallback): (() => void) & { cancel: () => void } => {
  let rAF = -1;
  const schedule = () => {
    window.cancelAnimationFrame(rAF);
    rAF = window.requestAnimationFrame(renderer);
  };
  schedule.cancel = () => window.cancelAnimationFrame(rAF);
  return schedule;
};

/** @internal */
export const withDeltaTime = (renderer: FrameRequestCallback) => {
  let prevT = 0;
  return (t: DOMHighResTimeStamp) => {
    const deltaT = t - prevT;
    prevT = t;
    renderer(deltaT);
  };
};
