/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

type Callback = () => void;

const subscribers = new Set<Callback>();

function handleDPRChange() {
  subscribers.forEach((cb) => cb());
  if (subscribers.size > 0) setupListener();
}

function setupListener() {
  window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', handleDPRChange, {
    once: true,
  });
}

/**
 * Subscribe to device pixel ratio changes (browser zoom, monitor drag).
 * A single shared matchMedia listener is used regardless of how many
 * callers subscribe. Returns an unsubscribe function.
 * @internal
 */
export function subscribeToDPRChange(cb: Callback): () => void {
  if (subscribers.size === 0) setupListener();
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
