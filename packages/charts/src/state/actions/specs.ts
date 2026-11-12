/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

import type { Spec } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges

/** @internal */
export const upsertSpec = createAction<Spec>('UPSERT_SPEC');

/**
 * Adds several specs at once, so the state changes once however many there are.
 * @internal
 */
export const upsertSpecs = createAction<Spec[]>('UPSERT_SPECS');

/** @internal */
export const removeSpec = createAction<string>('REMOVE_SPEC');

/** @internal */
export const specParsed = createAction('SPEC_PARSED');

/** @internal */
export const specUnmounted = createAction('SPEC_UNMOUNTED');
