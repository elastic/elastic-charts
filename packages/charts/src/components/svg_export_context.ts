/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';
import { createContext } from 'react';

import type { SvgNode } from '../renderers/svg/painter';
import type { GlobalChartState } from '../state/chart_state';

/**
 * What a chart exposes while it is rendered for an SVG export: its store and the content of every
 * svg stage it painted, in paint order.
 * @internal
 */
export interface SvgExportCollector {
  /** the size of a chart whose own `size` is not in pixels */
  size?: { width: number; height: number };
  stores: Set<Store<GlobalChartState>>;
  stages: Array<{ nodes: SvgNode[]; width: number; height: number }>;
}

/** @internal */
export const SvgExportContext = createContext<SvgExportCollector | null>(null);
