/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { SvgNode } from './painter';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';

/** React attribute spellings that differ from the SVG attribute names */
const ATTRIBUTE_NAMES: Record<string, string> = {
  clipPath: 'clip-path',
  clipRule: 'clip-rule',
  fillOpacity: 'fill-opacity',
  fillRule: 'fill-rule',
  paintOrder: 'paint-order',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  strokeDasharray: 'stroke-dasharray',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeOpacity: 'stroke-opacity',
  strokeWidth: 'stroke-width',
  textAnchor: 'text-anchor',
};

const toKebab = (name: string) => name.replaceAll(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function setAttributes(element: Element, attrs: Record<string, unknown>) {
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (name === 'style' && typeof value === 'object') {
      const style = Object.entries(value as Record<string, unknown>)
        .map(([property, v]) => `${toKebab(property)}:${String(v)}`)
        .join(';');
      if (style) element.setAttribute('style', style);
    } else if (name === 'xmlSpace') {
      element.setAttributeNS(XML_NS, 'xml:space', String(value));
    } else {
      element.setAttribute(ATTRIBUTE_NAMES[name] ?? name, String(value));
    }
  }
}

/**
 * Turns a recorded SVG tree into DOM elements, for the stages that commit frames themselves
 * instead of rendering through React (timeslip's own frame loop). Empty groups are dropped, as in
 * `svgNodesToReact`.
 * @internal
 */
export function svgNodesToDom(nodes: SvgNode[], doc: Document = document): Element[] {
  const elements: Element[] = [];
  for (const node of nodes) {
    const children = node.children && node.children.length > 0 ? svgNodesToDom(node.children, doc) : [];
    if (node.text === undefined && node.tag === 'g' && children.length === 0) continue;
    const element = doc.createElementNS(SVG_NS, node.tag);
    setAttributes(element, node.attrs);
    if (node.text !== undefined) element.textContent = node.text;
    for (const child of children) element.appendChild(child);
    elements.push(element);
  }
  return elements;
}

/**
 * Replaces the content of an `<svg>` element with a recorded frame.
 * @internal
 */
export function commitSvgNodes(svg: SVGSVGElement, nodes: SvgNode[]) {
  svg.replaceChildren(...svgNodesToDom(nodes, svg.ownerDocument));
}
