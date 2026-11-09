/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createFrameSurface } from './frame_surface';

describe('createFrameSurface', () => {
  it('commits frames into an svg element, sized per frame', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const surface = createFrameSurface(svg, 'chart');
    expect(surface?.devicePixelRatio).toBe(1);
    const painter = surface!.beginFrame(100, 50);
    painter.fillStyle = 'red';
    painter.fillRect(0, 0, 10, 10);
    surface!.endFrame();
    expect(svg.getAttribute('viewBox')).toBe('0 0 100 50');
    expect(svg.getAttribute('width')).toBe('100');
    expect(svg.innerHTML).toBe('<rect x="0" y="0" width="10" height="10" fill="red"></rect>');

    // the next frame replaces the previous one
    surface!.beginFrame(100, 50).fillRect(1, 1, 2, 2);
    surface!.endFrame();
    expect(svg.children.length).toBe(1);
    expect(svg.firstElementChild!.getAttribute('x')).toBe('1');
  });

  it('is null for a canvas without a 2d context (jsdom)', () => {
    expect(createFrameSurface(document.createElement('canvas'), 'chart')).toBeNull();
  });
});
