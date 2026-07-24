/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/spec_type';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSpecsFromStore } from '../../../../state/utils/get_specs_from_store';
import type { TraceAnnotationSpec } from '../../trace_api';

/**
 * Collects every composed Trace annotation child spec (Spec 29). Annotation specs register with
 * `ChartType.Trace` + `SpecType.Annotation`, distinct from the single `SpecType.Series` Trace spec,
 * so this mirrors XY's annotation-spec collection. Returns a fresh array whenever `state.specs`
 * changes (which is on every spec upsert), so downstream annotation resolution memoizes on this
 * array reference rather than folding it into the span pipeline cache.
 * @internal
 */
export const getTraceAnnotationSpecsSelector = createCustomCachedSelector(
  [(state: GlobalChartState) => state.specs],
  (specs): TraceAnnotationSpec[] =>
    getSpecsFromStore<TraceAnnotationSpec>(specs, ChartType.Trace, SpecType.Annotation),
);
