/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { svgNodesToDom } from './to_dom';

describe('svgNodesToDom', () => {
  it('creates namespaced elements with SVG attribute names, inline styles and text', () => {
    const [defs, path, text] = svgNodesToDom([
      {
        tag: 'defs',
        attrs: {},
        children: [{ tag: 'clipPath', attrs: { id: 'c', clipPathUnits: 'userSpaceOnUse' }, children: [] }],
      },
      {
        tag: 'path',
        attrs: {
          d: 'M0,0',
          fill: 'red',
          fillOpacity: 0.5,
          strokeWidth: 2,
          clipPath: 'url(#c)',
          style: { transition: 'fill 1s' },
        },
      },
      {
        tag: 'text',
        attrs: { x: 1, textAnchor: 'middle', xmlSpace: 'preserve', style: { font: '10px x' } },
        text: ' a ',
      },
    ]);
    expect(defs!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(defs!.firstElementChild!.outerHTML).toBe('<clipPath id="c" clipPathUnits="userSpaceOnUse"></clipPath>');
    expect(path!.outerHTML).toBe(
      '<path d="M0,0" fill="red" fill-opacity="0.5" stroke-width="2" clip-path="url(#c)" style="transition:fill 1s"></path>',
    );
    expect(text!.outerHTML).toBe(
      '<text x="1" text-anchor="middle" xml:space="preserve" style="font:10px x"> a </text>',
    );
  });

  it('drops groups that end up empty', () => {
    expect(
      svgNodesToDom([
        { tag: 'g', attrs: {}, children: [{ tag: 'g', attrs: { transform: 'translate(1 1)' }, children: [] }] },
      ]),
    ).toEqual([]);
  });
});
