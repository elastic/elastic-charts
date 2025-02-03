/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { OptionalKeys, RequiredKeys } from 'utility-types';

import { Spec } from '../specs/spec';

/*
------------------------------------------------------------
  Reused types to maintain single source of truth
------------------------------------------------------------
*/

/**
 * Resulting props for spec given overrides, defaults, optionals and required props
 * @public
 */
export type SFProps<
  S extends Spec,
  Overrides extends SFOverrideKeys<S>,
  Defaults extends SFDefaultKeys<S, Overrides>,
  Optionals extends SFOptionalKeys<S, Overrides, Defaults>,
  Requires extends SFRequiredKeys<S, Overrides, Defaults, Optionals>,
> = Pick<S, Optionals | Requires> & Partial<Pick<S, Defaults>>;

/** @public */
export interface BuildProps<
  S extends Spec,
  Overrides extends SFOverrideKeys<S>,
  Defaults extends SFDefaultKeys<S, Overrides>,
  Optionals extends SFOptionalKeys<S, Overrides, Defaults>,
  Requires extends SFRequiredKeys<S, Overrides, Defaults, Optionals>,
> {
  overrides: SFOverrides<S, Overrides>;
  defaults: SFDefaults<S, Overrides, Defaults>;
  /** @deprecated - ignore - used only as type do not use as value */
  optionals: Pick<S, Optionals>;
  /** @deprecated - ignore - used only as type do not use as value */
  requires: Pick<S, Requires>;
}

/** All specs __must__ provide these as overrides */
type RequiredSpecProps = keyof Pick<Spec, 'chartType' | 'specType'>;

/**
 * Types defining keys
 * @internal
 */
export type SFOverrideKeys<S extends Spec> = keyof S;
/** @internal */
export type SFDefaultKeys<S extends Spec, Overrides extends keyof S> = keyof Omit<S, Overrides>;
/** @internal */
export type SFOptionalKeys<
  S extends Spec,
  Overrides extends keyof S,
  Defaults extends keyof Omit<S, Overrides>,
> = OptionalKeys<Omit<S, Overrides | Defaults>>;
/** @internal */
export type SFRequiredKeys<
  S extends Spec,
  Overrides extends keyof S,
  Defaults extends keyof Omit<S, Overrides>,
  Optionals extends SFOptionalKeys<S, Overrides, Defaults>,
> = RequiredKeys<Omit<S, Overrides | Defaults | Optionals>>;

/**
 * Object types defined from key types above
 * @internal
 */
export type SFOverrides<S extends Spec, Overrides extends keyof S> = Required<Pick<S, Overrides | RequiredSpecProps>>;
/** @internal */
export type SFDefaults<
  S extends Spec,
  Overrides extends SFOverrideKeys<S>,
  Defaults extends SFDefaultKeys<S, Overrides>,
> = Required<Pick<S, Defaults>>;
