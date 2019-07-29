import { Spec } from '../../specs';

export const UPSERT_SPEC = 'UPSERT_SPEC';
export const REMOVE_SPEC = 'REMOVE_SPEC';
export const SPEC_PARSED = 'SPEC_PARSED';

export interface SpecParsedAction {
  type: typeof SPEC_PARSED;
}

export interface UpsertSpecAction {
  type: typeof UPSERT_SPEC;
  spec: Spec;
}

export interface RemoveSpecAction {
  type: typeof REMOVE_SPEC;
  id: string;
}

export function upsertSpec(spec: Spec): UpsertSpecAction {
  return { type: UPSERT_SPEC, spec };
}

export function removeSpec(id: string): RemoveSpecAction {
  return { type: REMOVE_SPEC, id };
}

export function specParsed(): SpecParsedAction {
  return { type: SPEC_PARSED };
}
