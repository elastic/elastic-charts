/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FC, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { OptionalKeys, RequiredKeys } from 'utility-types';

import { upsertSpec as upsertSpecAction, removeSpec as removeSpecAction } from './actions/specs';
import { Spec as Spec } from '../specs';
import { stripUndefined } from '../utils/common';

/** @internal */
export interface DispatchProps {
  upsertSpec: typeof upsertSpecAction;
  removeSpec: typeof removeSpecAction;
}

/**
 * Used inside custom spec component to link component to state as new spec
 * @internal
 */
export function useSpecFactory<Props extends Spec>(props: Props) {
  const dispatch = useDispatch();
  const { upsertSpec, removeSpec } = useMemo(
    () => ({
      upsertSpec: bindActionCreators(upsertSpecAction, dispatch),
      removeSpec: bindActionCreators(removeSpecAction, dispatch),
    }),
    [dispatch],
  );

  useEffect(() => {
    upsertSpec(props);
  });
  useEffect(
    () => () => {
      removeSpec(props.id);
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
}

/**
 * Creates spec component factory given overrides and default props.
 *
 * To use this you must pass the Spec type via empty function call...
 *
 * ```ts
 * const MyThing = specComponentFactory<MyThingSpec>()(overrides, defaults)
 * ```
 *
 * > IMPORTANT: Both `overrides` and `defaults` should __NOT__ have explicit types.
 * > The types are determined automatically from thier implicitly defined types, while still
 * > enforing that the types are derived from the defined `Spec`.
 * @internal
 */
export const specComponentFactory =
  <S extends Spec>() =>
  <
    Overrides extends SFOverrideKeys<S>,
    Defaults extends SFDefaultKeys<S, Overrides>,
    Optionals extends SFOptionalKeys<S, Overrides, Defaults>,
    Requires extends SFRequiredKeys<S, Overrides, Defaults, Optionals>,
  >(
    overrides: SFOverrides<S, Overrides>,
    defaults: SFDefaults<S, Overrides, Defaults>,
  ): FC<SFProps<S, Overrides, Defaults, Optionals, Requires>> => {
    return (props) => {
      // @ts-ignore - All Spec keys are guaranteed to be included
      useSpecFactory<S>({ ...defaults, ...stripUndefined(props), ...overrides });
      return null;
    };
  };

/**
 * Takes in prop overrides and defaults with enforced types.
 * Determines implicit types of optional and required props.
 *
 * To use this you must pass the Spec type via empty function call...
 *
 * ```ts
 * const MyThingBuildProps = buildSFProps<MyThingSpec>()(overrides, defaults)
 * ```
 *
 * > IMPORTANT: Both `overrides` and `defaults` should __NOT__ have explicit types.
 * > The types are determined automatically from thier implicitly defined types, while still
 * > enforing that the types are derived from the defined `Spec`.
 * @internal
 */
export const buildSFProps =
  <S extends Spec>() =>
  <
    Overrides extends SFOverrideKeys<S>,
    Defaults extends SFDefaultKeys<S, Overrides>,
    Optionals extends SFOptionalKeys<S, Overrides, Defaults>,
    Requires extends SFRequiredKeys<S, Overrides, Defaults, Optionals>,
  >(
    overrides: SFOverrides<S, Overrides>,
    defaults: SFDefaults<S, Overrides, Defaults>,
  ): BuildProps<S, Overrides, Defaults, Optionals, Requires> => ({
    overrides,
    defaults,
    optionals: {} as Pick<S, Optionals>, // used to transfer type only
    requires: {} as Pick<S, Requires>, // used to transfer type only
  });

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

/* Types defining keys */
type SFOverrideKeys<S extends Spec> = keyof S;
type SFDefaultKeys<S extends Spec, Overrides extends keyof S> = keyof Omit<S, Overrides>;
type SFOptionalKeys<
  S extends Spec,
  Overrides extends keyof S,
  Defaults extends keyof Omit<S, Overrides>,
> = OptionalKeys<Omit<S, Overrides | Defaults>>;
type SFRequiredKeys<
  S extends Spec,
  Overrides extends keyof S,
  Defaults extends keyof Omit<S, Overrides>,
  Optionals extends SFOptionalKeys<S, Overrides, Defaults>,
> = RequiredKeys<Omit<S, Overrides | Defaults | Optionals>>;

/* Object types defined from key types above */
type SFOverrides<S extends Spec, Overrides extends keyof S> = Required<Pick<S, Overrides | RequiredSpecProps>>;
type SFDefaults<
  S extends Spec,
  Overrides extends SFOverrideKeys<S>,
  Defaults extends SFDefaultKeys<S, Overrides>,
> = Required<Pick<S, Defaults>>;
