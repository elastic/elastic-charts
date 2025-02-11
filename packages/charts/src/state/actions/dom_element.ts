/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';
import { $Values } from 'utility-types';

/** @internal */
export const DOMElementType = Object.freeze({
  LineAnnotationMarker: 'LineAnnotationMarker' as const,
});
/** @internal */
export type DOMElementType = $Values<typeof DOMElementType>;

/** @internal */
export interface DOMElement {
  type: DOMElementType;
  id: string;
  createdBySpecId: string; // TODO is that + datum enough to identify the elements?
  datum: unknown;
}

/** @internal */
export const onDOMElementLeave = createAction('ON_DOM_ELEMENT_LEAVE');

/** @internal */
export const onDOMElementEnter = createAction<DOMElement>('ON_DOM_ELEMENT_ENTER');

/** @internal */
export const onDOMElementClick = createAction('ON_DOM_ELEMENT_CLICK');
