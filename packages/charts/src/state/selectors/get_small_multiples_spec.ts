/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecs } from './get_specs';
import { ChartType } from '../../chart_types';
import { SpecType } from '../../specs/constants';
import { SmallMultiplesSpec } from '../../specs/small_multiples';
import { createCustomCachedSelector } from '../create_selector';
import { getSpecsFromStore, getSpecFromStore } from '../utils';

/**
 * Return the small multiple specs
 * @internal
 */
export const getSmallMultiplesSpecs = createCustomCachedSelector([getSpecs], (specs) =>
  getSpecsFromStore<SmallMultiplesSpec>(specs, ChartType.Global, SpecType.SmallMultiples),
);

/**
 * Return the small multiple spec
 * @internal
 */
export const getSmallMultiplesSpec = createCustomCachedSelector([getSpecs], (specs) =>
  getSpecFromStore<SmallMultiplesSpec, false>(specs, ChartType.Global, SpecType.SmallMultiples, false),
);
