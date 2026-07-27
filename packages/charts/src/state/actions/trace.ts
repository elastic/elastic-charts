/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

/**
 * Publishes the Trace chart's **uncontrolled** collapsed span ids into redux so the screen-reader
 * selectors (which run off the store, ADR 0013) render the same collapsed tree the canvas shows.
 * In controlled mode the `TraceSpec.collapsedSpanIds` prop is already visible to the selectors, so
 * the component does not dispatch this — the selector prefers the prop when present.
 * @internal
 */
export const setTraceUncontrolledCollapsed = createAction<string[]>('SET_TRACE_UNCONTROLLED_COLLAPSED');
