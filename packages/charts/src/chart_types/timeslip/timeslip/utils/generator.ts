/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// @ts-noCheck

/** @internal */
export const toCallbackFn = (generatorObject) => {
  generatorObject.next(); // this starts the generator object, eg. resulting in initial render without any events
  return (event) => generatorObject.next(event);
};

/** @internal */
export const observe = (eventTarget, commonHandler, handlers) => {
  for (const eventName in handlers) eventTarget.addEventListener(eventName, commonHandler, { passive: false });
  // the returned function allows the removal of the event listeners if needed
  return () => {
    for (const eventName in handlers) eventTarget.removeEventListener(eventName, commonHandler);
  };
};
