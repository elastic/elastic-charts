/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
  SFDefaults,
  SFDefaultKeys,
  SFOptionalKeys,
  SFOverrides,
  SFOverrideKeys,
  SFProps,
  SFRequiredKeys,
} from './build_props_types';
import { Spec } from '../specs';
import { upsertSpec, removeSpec } from '../state/actions/specs';
import { stripUndefined } from '../utils/common';

/**
 * Used inside custom spec component to link component to state as new spec
 * @internal
 */
export function useSpecFactory<Props extends Spec>(props: Props) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(upsertSpec(props));
  });
  useEffect(
    () => () => {
      dispatch(removeSpec(props.id));
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
 * > The types are determined automatically from their implicitly defined types, while still
 * > enforcing that the types are derived from the defined `Spec`.
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
