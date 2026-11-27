/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Stands in for `@popperjs/core` in the headless file of the build for Node. A popper places an element next
 * to another on a page; the chart asks for one in an effect, which a headless render never runs.
 * @internal
 */
export const createPopper = (): never => {
  throw new Error('A headless chart has no page to place an element on');
};
