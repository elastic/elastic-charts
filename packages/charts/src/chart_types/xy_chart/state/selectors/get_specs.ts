/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSpecs } from '../../../../state/selectors/get_specs';
import { getSpecsFromStore } from '../../../../state/utils/get_specs_from_store';
import { AnnotationSpec, AxisSpec, BasicSeriesSpec } from '../../utils/specs';

/** @internal */
export const getAxisSpecsSelector = createCustomCachedSelector([getSpecs], (specs): AxisSpec[] =>
  getSpecsFromStore<AxisSpec>(specs, ChartType.XYAxis, SpecType.Axis),
);

/** @internal */
export const axisSpecsLookupSelector = createCustomCachedSelector(
  getAxisSpecsSelector,
  (axisSpecs: AxisSpec[]): Map<string, AxisSpec> => axisSpecs.reduce((acc, spec) => acc.set(spec.id, spec), new Map()),
);

/** @internal */
export const getSeriesSpecsSelector = createCustomCachedSelector([getSpecs], (specs) => {
  return getSpecsFromStore<BasicSeriesSpec>(specs, ChartType.XYAxis, SpecType.Series);
});

/** @internal */
export const getAnnotationSpecsSelector = createCustomCachedSelector([getSpecs], (specs) =>
  getSpecsFromStore<AnnotationSpec>(specs, ChartType.XYAxis, SpecType.Annotation),
);
