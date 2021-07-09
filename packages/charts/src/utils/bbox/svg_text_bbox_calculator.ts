/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BBox, BBoxCalculator } from './bbox_calculator';

/** @internal */
export class SvgTextBBoxCalculator implements BBoxCalculator {
  svgElem: SVGSVGElement;

  textElem: SVGTextElement;

  attachedRoot: HTMLElement;

  textNode: Text;

  // TODO specify styles for text
  // TODO specify how to hide the svg from the current dom view
  // like moving it a -9999999px
  constructor(rootElement?: HTMLElement) {
    const xmlns = 'http://www.w3.org/2000/svg';
    this.svgElem = document.createElementNS(xmlns, 'svg');
    this.textElem = document.createElementNS(xmlns, 'text');
    this.svgElem.appendChild(this.textElem);
    this.textNode = document.createTextNode('');
    this.textElem.appendChild(this.textNode);
    this.attachedRoot = rootElement || document.documentElement;
    this.attachedRoot.appendChild(this.svgElem);
  }

  compute(text: string): BBox {
    this.textNode.textContent = text;
    const rect = this.textElem.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  destroy(): void {
    this.attachedRoot.removeChild(this.svgElem);
  }
}
