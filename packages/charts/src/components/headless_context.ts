/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';
import { createContext } from 'react';

import type { Spec } from '../specs/spec_type';
import type { GlobalChartState } from '../state/chart_state';
import type { Dimensions } from '../utils/dimensions';

/**
 * What a render without a DOM shares with the `Chart` it renders. Effects do not run there, so the
 * chart is rendered twice: once to learn its store, its size and its specs, then, with the store
 * filled in, for the markup.
 * @internal
 */
export interface HeadlessRender {
  /** the store of the chart, set by the `Chart` in the first pass and used by it in the second */
  store?: Store<GlobalChartState>;
  /** the size of the chart in pixels, when it has one */
  size?: Pick<Dimensions, 'width' | 'height'> | null;
  /** how many `Chart`s the element rendered */
  charts: number;
  /** receives each spec as its component renders; absent in the second pass */
  collect?: (spec: Spec) => void;
}

/** @internal */
export const HeadlessContext = createContext<HeadlessRender | null>(null);
