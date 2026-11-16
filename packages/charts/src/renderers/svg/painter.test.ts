/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TextEncoder } from 'util';

import type { ReactElement } from 'react';
import { createElement } from 'react';

import { SvgPainter } from './painter';
import { svgNodesToReact } from './to_react';
import { Logger } from '../../utils/logger';

// jsdom lacks TextEncoder, which the React server renderer needs
Object.assign(globalThis, { TextEncoder: globalThis.TextEncoder ?? TextEncoder });
// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const { renderToStaticMarkup } = require('react-dom/server') as { renderToStaticMarkup: (e: ReactElement) => string };

const paint = (draw: (p: SvgPainter) => void, options?: Partial<ConstructorParameters<typeof SvgPainter>[0]>) => {
  const p = new SvgPainter({ width: 100, height: 50, idPrefix: 'c', ...options });
  draw(p);
  return renderToStaticMarkup(createElement('svg', {}, ...svgNodesToReact(p.nodes()))).replaceAll(
    /^<svg>|<\/svg>$/g,
    '',
  );
};

describe('SvgPainter', () => {
  it('nests groups for save and transforms, and fills the current path', () => {
    expect(
      paint((p) => {
        p.save();
        p.translate(10, 20);
        p.fillStyle = 'red';
        p.beginPath();
        p.rect(0, 0, 5, 5);
        p.fill();
        p.restore();
      }),
    ).toBe('<g><g transform="translate(10 20)"><path d="M0,0h5v5h-5Z" fill="red"></path></g></g>');
  });

  it('pops to the matching save, so later drawing is outside the earlier transforms', () => {
    expect(
      paint((p) => {
        p.save();
        p.rotate(Math.PI / 2);
        p.scale(1, -1);
        p.restore();
        p.fillRect(1, 1, 2, 2);
      }),
    ).toBe('<rect x="1" y="1" width="2" height="2" fill="#000000"></rect>');
  });

  it('drops empty groups and no-op transforms', () => {
    expect(
      paint((p) => {
        p.save();
        p.translate(0, 0);
        p.scale(1, 1);
        p.rotate(0);
        p.restore();
      }),
    ).toBe('');
  });

  it('splits the alpha of rgba colors into an opacity and folds in globalAlpha', () => {
    expect(
      paint((p) => {
        p.fillStyle = 'rgba(255, 0, 0, 0.5)';
        p.globalAlpha = 0.5;
        p.fillRect(0, 0, 1, 1);
      }),
    ).toBe('<rect x="0" y="0" width="1" height="1" fill="rgb(255,0,0)" fill-opacity="0.25"></rect>');
  });

  it('emits stroke attributes only when they differ from the SVG defaults', () => {
    expect(
      paint((p) => {
        p.strokeStyle = '#123456';
        p.lineWidth = 2;
        p.lineCap = 'round';
        p.lineJoin = 'round';
        p.setLineDash([4, 2]);
        p.beginPath();
        p.moveTo(0, 0);
        p.lineTo(10, 0);
        p.stroke();
        p.setLineDash([]);
        p.lineWidth = 0; // ignored, as on canvas
        p.lineCap = 'butt';
        p.lineJoin = 'miter';
        p.stroke();
      }),
    ).toBe(
      '<path d="M0,0L10,0" fill="none" stroke="#123456" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 2"></path>' +
        '<path d="M0,0L10,0" fill="none" stroke="#123456" stroke-width="2"></path>',
    );
  });

  it('clips with a clipPath in defs and keeps later transforms inside the clipped group', () => {
    expect(
      paint((p) => {
        p.save();
        p.beginPath();
        p.rect(0, 0, 10, 10);
        p.clip();
        p.translate(5, 5);
        p.fillRect(0, 0, 1, 1);
        p.restore();
        p.fillRect(2, 2, 1, 1);
      }),
    ).toBe(
      '<defs><clipPath id="c-clip-1" clipPathUnits="userSpaceOnUse"><path d="M0,0h10v10h-10Z"></path></clipPath></defs>' +
        '<g><g clip-path="url(#c-clip-1)"><g transform="translate(5 5)"><rect x="0" y="0" width="1" height="1" fill="#000000"></rect></g></g></g>' +
        '<rect x="2" y="2" width="1" height="1" fill="#000000"></rect>',
    );
  });

  it('places text on the alphabetic baseline with a dy for the canvas baseline, and maps the anchor', () => {
    expect(
      paint((p) => {
        p.font = '12px Arial';
        p.textAlign = 'center';
        p.textBaseline = 'middle';
        p.fillStyle = 'blue';
        p.fillText('hi', 1, 2);
      }),
    ).toBe('<text x="1" y="2" dy="3.6" text-anchor="middle" style="font:12px Arial" fill="blue">hi</text>');
  });

  it('resolves left and right against the inherited direction and emits an explicit direction', () => {
    expect(
      paint(
        (p) => {
          p.textAlign = 'left';
          p.fillText('a', 0, 0);
          p.direction = 'ltr';
          p.fillText('b', 0, 0);
        },
        { direction: 'rtl' },
      ),
    ).toBe(
      '<text x="0" y="0" text-anchor="end" style="font:10px sans-serif" fill="#000000">a</text>' +
        '<text x="0" y="0" direction="ltr" style="font:10px sans-serif" fill="#000000">b</text>',
    );
  });

  it('strokes text as a separate element and preserves significant whitespace', () => {
    expect(
      paint((p) => {
        p.strokeStyle = 'white';
        p.lineWidth = 3;
        p.strokeText(' a  b', 0, 0);
      }),
    ).toBe(
      '<text x="0" y="0" xml:space="preserve" style="font:10px sans-serif" fill="none" stroke="white" stroke-width="3"> a  b</text>',
    );
  });

  it('puts the background rect under everything', () => {
    expect(
      paint((p) => {
        p.fillRect(0, 0, 1, 1);
        p.clear('white');
        p.clear('transparent');
      }),
    ).toBe(
      '<rect x="0" y="0" width="100" height="50" fill="white"></rect><rect x="0" y="0" width="1" height="1" fill="#000000"></rect>',
    );
  });

  it('normalizes a negative rect size and skips an empty one', () => {
    expect(
      paint((p) => {
        p.fillRect(10, 10, -4, -2);
        p.fillRect(0, 0, 0, 5);
      }),
    ).toBe('<rect x="6" y="8" width="4" height="2" fill="#000000"></rect>');
  });

  it('registers a gradient in defs on first use', () => {
    expect(
      paint((p) => {
        const gradient = p.createLinearGradient(0, 0, 0, 10);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(1, 'rgba(0,0,255,0.5)');
        p.fillStyle = gradient;
        p.fillPath('M0,0L1,1');
        p.fillPath('M2,2L3,3', 'evenodd');
      }),
    ).toBe(
      '<defs><linearGradient id="c-gradient-1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="10">' +
        '<stop offset="0" stop-color="red"></stop><stop offset="1" stop-color="rgb(0,0,255)" stop-opacity="0.5"></stop></linearGradient></defs>' +
        '<path d="M0,0L1,1" fill="url(#c-gradient-1)"></path><path d="M2,2L3,3" fill-rule="evenodd" fill="url(#c-gradient-1)"></path>',
    );
  });

  it('registers a texture as a pattern tile in defs, and reuses it', () => {
    expect(
      paint((p) => {
        const texture = {
          width: 12,
          height: 8,
          path: 'M -4 0 L 4 0',
          shapeRotation: 45,
          stroke: 'rgba(0,0,255,0.5)',
          strokeWidth: 2,
          opacity: 0.5,
          rotation: 30,
          offset: { x: 1, y: 2, global: true },
        };
        p.fillStyle = p.createPattern(texture)!;
        p.fillRect(0, 0, 10, 10);
        p.fillStyle = p.createPattern({ ...texture })!;
        p.fillRect(10, 10, 10, 10);
      }),
    ).toBe(
      '<defs><pattern id="c-pattern-1" patternUnits="userSpaceOnUse" width="12" height="8" patternTransform="translate(1 2) rotate(30)">' +
        '<path d="M -4 0 L 4 0" transform="translate(6 4) rotate(45)" fill="none" stroke="rgb(0,0,255)" stroke-opacity="0.5" stroke-width="2" opacity="0.5"></path>' +
        '</pattern></defs>' +
        '<rect x="0" y="0" width="10" height="10" fill="url(#c-pattern-1)"></rect>' +
        '<rect x="10" y="10" width="10" height="10" fill="url(#c-pattern-1)"></rect>',
    );
  });

  it('cannot paint a Path2D texture and says so', () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const p = new SvgPainter({ width: 1, height: 1, idPrefix: 'c' });
    expect(
      p.createPattern({
        width: 1,
        height: 1,
        path: {} as Path2D,
        shapeRotation: 0,
        stroke: 'red',
        strokeWidth: 1,
        opacity: 1,
      }),
    ).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('animates paint changes through an inline CSS transition while one is in effect', () => {
    expect(
      paint((p) => {
        p.save();
        p.transition = { duration: 250, delay: 50, timeFunction: 'easeInOut' };
        p.fillStyle = 'red';
        p.fillRect(0, 0, 1, 1);
        p.restore();
        p.fillRect(1, 1, 1, 1);
      }),
    ).toBe(
      '<g><rect x="0" y="0" width="1" height="1" fill="red" style="transition:fill 250ms ease-in-out 50ms, fill-opacity 250ms ease-in-out 50ms, stroke 250ms ease-in-out 50ms, stroke-opacity 250ms ease-in-out 50ms, opacity 250ms ease-in-out 50ms"></rect></g>' +
        '<rect x="1" y="1" width="1" height="1" fill="#000000"></rect>',
    );
  });

  it('sanitizes the id prefix', () => {
    expect(
      paint(
        (p) => {
          p.beginPath();
          p.clip();
        },
        { idPrefix: 'my chart/1' },
      ),
    ).toBe('<defs><clipPath id="my_20_chart_2f_1-clip-1" clipPathUnits="userSpaceOnUse"></clipPath></defs>');
  });

  it('measures nothing without a canvas', () => {
    const p = new SvgPainter({ width: 1, height: 1, idPrefix: 'c' });
    expect(p.measureText('abc')).toEqual({ width: 0 });
  });
});
