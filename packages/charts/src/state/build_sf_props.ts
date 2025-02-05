/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  BuildProps,
  SFDefaults,
  SFDefaultKeys,
  SFOptionalKeys,
  SFOverrides,
  SFOverrideKeys,
  SFRequiredKeys,
} from './build_props_types';
import { Spec } from '../specs';

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
 * > The types are determined automatically from their implicitly defined types, while still
 * > enforcing that the types are derived from the defined `Spec`.
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
