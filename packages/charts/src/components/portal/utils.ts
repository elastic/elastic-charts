/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Required } from 'utility-types';

import { TooltipPortalSettings, Placement } from './types';

/** @internal */
export const DEFAULT_POPPER_SETTINGS: Required<TooltipPortalSettings, 'fallbackPlacements' | 'placement' | 'offset'> = {
  fallbackPlacements: [Placement.Right, Placement.Left, Placement.Top, Placement.Bottom],
  placement: Placement.Right,
  offset: 10,
};

/**
 * Creates new dom element with given id and attaches to parent
 *
 * @internal
 */
export function getOrCreateNode(
  id: string,
  className?: string,
  parent?: HTMLElement | null,
  zIndex: number = 0,
): HTMLDivElement {
  // eslint-disable-next-line unicorn/prefer-query-selector
  const node = document.getElementById(id);
  if (node) {
    return node as HTMLDivElement;
  }

  const newNode = document.createElement('div');
  newNode.id = id;
  if (className) {
    newNode.classList.add(className);
  }
  newNode.style.zIndex = `${zIndex}`;
  (parent ?? document.body).appendChild(newNode);
  return newNode;
}

/**
 * @link https://stackoverflow.com/questions/254302/how-can-i-determine-the-type-of-an-html-element-in-javascript
 * @internal
 */
export function isHTMLElement(value: any): value is HTMLElement {
  return typeof value === 'object' && value !== null && 'nodeName' in value;
}

/**
 * Returns the top-most defined z-index in the element's ancestor hierarchy
 * relative to the `target` element; if no z-index is defined, returns 0
 * @param element {HTMLElement}
 * @param cousin {HTMLElement}
 * @returns {number}
 * @internal
 */
export function getElementZIndex(element: HTMLElement, cousin: HTMLElement): number {
  /**
   * finding the z-index of `element` is not the full story
   * its the CSS stacking context that is important
   * take this DOM for example:
   * body
   *   section[z-index: 1000]
   *     p[z-index: 500]
   *       button
   *   div
   *
   * what z-index does the `div` need to display next to `button`?
   * the `div` and `section` are where the stacking context splits
   * so `div` needs to copy `section`'s z-index in order to
   * appear next to / over `button`
   *
   * calculate this by starting at `button` and finding its offsetParents
   * then walk the parents from top -> down until the stacking context
   * split is found, or if there is no split then a specific z-index is unimportant
   */

  // build the array of the element + its offset parents
  const nodesToInspect: HTMLElement[] = [];
  while (true) {
    nodesToInspect.push(element);

    // AFAICT this is a valid cast - the libdefs appear wrong
    element = element.offsetParent as HTMLElement;

    // stop if there is no parent
    if (!element) {
      break;
    }

    // stop if the parent contains the related element
    // as this is the z-index ancestor
    if (element.contains(cousin)) {
      break;
    }
  }

  // reverse the nodes to walk from top -> element
  for (let i = nodesToInspect.length - 1; i >= 0; i--) {
    const node = nodesToInspect[i];
    if (!node) continue;

    // get this node's z-index css value
    const zIndex = window.document.defaultView!.getComputedStyle(node).getPropertyValue('z-index');

    // if the z-index is not a number (e.g. "auto") return null, else the value
    const parsedZIndex = parseInt(zIndex, 10);
    if (Number.isFinite(parsedZIndex)) {
      return parsedZIndex;
    }
  }

  return 0;
}
