/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

import { Spec } from '../../specs';

/** @internal */
export const upsertSpec = createAction<Spec>('UPSERT_SPEC');

/** @internal */
export const removeSpec = createAction<string>('REMOVE_SPEC');

/** @internal */
export const specParsed = createAction('SPEC_PARSED');

/** @internal */
export const specUnmounted = createAction('SPEC_UNMOUNTED');
