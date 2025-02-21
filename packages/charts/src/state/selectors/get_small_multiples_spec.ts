/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecs } from './get_specs';
import { ChartType } from '../../chart_types';
import type { SmallMultiplesSpec } from '../../specs';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { createCustomCachedSelector } from '../create_selector';
import { getSpecFromStore } from '../utils/get_spec_from_store';
import { getSpecsFromStore } from '../utils/get_specs_from_store';

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
