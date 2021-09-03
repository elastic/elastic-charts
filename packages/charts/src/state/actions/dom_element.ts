/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

/** @internal */
export const ON_DOM_ELEMENT_ENTER = 'ON_DOM_ELEMENT_ENTER';
/** @internal */
export const ON_DOM_ELEMENT_LEAVE = 'ON_DOM_ELEMENT_LEAVE';
/** @internal */
export const ON_DOM_ELEMENT_CLICK = 'ON_DOM_ELEMENT_CLICK';

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
interface DOMElementEnterAction {
  type: typeof ON_DOM_ELEMENT_ENTER;
  element: DOMElement;
}

interface DOMElementLeaveAction {
  type: typeof ON_DOM_ELEMENT_LEAVE;
}

interface DOMElementClickAction {
  type: typeof ON_DOM_ELEMENT_CLICK;
}

/** @internal */
export function onDOMElementLeave(): DOMElementLeaveAction {
  return { type: ON_DOM_ELEMENT_LEAVE };
}

/** @internal */
export function onDOMElementEnter(element: DOMElement): DOMElementEnterAction {
  return { type: ON_DOM_ELEMENT_ENTER, element };
}

/** @internal */
export function onDOMElementClick(): DOMElementClickAction {
  return { type: ON_DOM_ELEMENT_CLICK };
}

/** @internal */
export type DOMElementActions = DOMElementEnterAction | DOMElementLeaveAction;
