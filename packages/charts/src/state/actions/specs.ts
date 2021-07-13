/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Spec } from '../../specs';

/** @internal */
export const UPSERT_SPEC = 'UPSERT_SPEC';

/** @internal */
export const REMOVE_SPEC = 'REMOVE_SPEC';

/** @internal */
export const SPEC_PARSED = 'SPEC_PARSED';

/** @internal */
export const SPEC_UNMOUNTED = 'SPEC_UNMOUNTED';

interface SpecParsedAction {
  type: typeof SPEC_PARSED;
}

interface SpecUnmountedAction {
  type: typeof SPEC_UNMOUNTED;
}

interface UpsertSpecAction {
  type: typeof UPSERT_SPEC;
  spec: Spec;
}

interface RemoveSpecAction {
  type: typeof REMOVE_SPEC;
  id: string;
}

/** @internal */
export function upsertSpec(spec: Spec): UpsertSpecAction {
  return { type: UPSERT_SPEC, spec };
}

/** @internal */
export function removeSpec(id: string): RemoveSpecAction {
  return { type: REMOVE_SPEC, id };
}

/** @internal */
export function specParsed(): SpecParsedAction {
  return { type: SPEC_PARSED };
}

/** @internal */
export function specUnmounted(): SpecUnmountedAction {
  return { type: SPEC_UNMOUNTED };
}

/** @internal */
export type SpecActions = SpecParsedAction | SpecUnmountedAction | UpsertSpecAction | RemoveSpecAction;
